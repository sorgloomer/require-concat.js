module.exports = function(grunt) {
    var path = require('path');
    var hasOwn = Object.prototype.hasOwnProperty;
    function hasProp(obj, name) {
        return hasOwn.call(obj, name);
    }

    function forEach(o, fn, ctx) {
        if (Array.isArray(o)) {
            Array.prototype.forEach.call(o, fn, ctx);
        } else if (typeof o === "object" && o !== null) {
            for (var key in o) {
                if (hasProp(o, key)) {
                    fn.call(ctx, o[key], key, o);
                }
            }
        }
    }
    function list(o, fn, ctx) {
        var result = [];
        forEach(o, function() {
            result.push(fn.apply(this, arguments));
        }, ctx);
        return result;
    }

    function bareify(str) {
        str = String(str);
        str = str.replace(/[\/\\\.\-]/g, "_").replace(/[^a-zA-Z0-9_$]/g, "");
        if (/^[0-9]/.test(str)) str = "_" + str;
        return str;
    }

    var PROCESSING = ".PROCESSING.";
    grunt.registerMultiTask('requireConcat', function() {
        var options = this.options({
            files: null,
            output: null,
            exports: null,
            base: "./",
            exportContext: "context",
            modulePrefix: "module$",
            generatedPrefix: "(function(context) {\n\n",
            generatedSuffix: "\n})(this);\n"
        });

        if (!options.files) throw new Error("options.files config must be present");
        if (!options.output) throw new Error("options.output config must be present");

        var exports = options.exports;
        if (Array.isArray(exports)) {
            exports = list(exports, function(name) {
                return {
                    moduleName: name,
                    exportName: name
                };
            });
        } else if (typeof exports === "object") {
            exports = list(exports, function(v, k) {
                return {
                    moduleName: v,
                    exportName: k
                };
            });
        } else if (typeof exports === "string") {
            exports = [{
                moduleName: exports,
                exportName: exports
            }];
        }

        var defined = {}, required = [];

        function extractArgs(args, defaultName) {
            var result;
            switch (args.length) {
                case 1:
                    result = { name: defaultName, deps: [], def: args[0] };
                    break;
                case 2:
                    result = { name: defaultName, deps: args[0], def: args[1] };
                    break;
                case 3:
                    result = { name: args[0], deps: args[1], def: args[2] };
                    break;
                default:
                    throw new Error("Unsupported call to define or require");
            }
            if (typeof result.deps === "string") result.deps = [result.deps];
            return result;
        }

        function loadFile(defaultName, filePath) {
            function defineMock() {
                var module = extractArgs(arguments, defaultName);
                if (hasProp(defined, module.name)) {
                    throw new Error("Module with name '" + module.name + "' defined more than once.");
                }
                defined[module.name] = module;
            }
            function requireMock() {
                var module = extractArgs(arguments, null);
                required.push(module);
            }

            var fileContent = grunt.file.read(filePath);
            var collector = new Function('define', 'require', fileContent);
            collector(defineMock, requireMock);
        }

        var files = grunt.file.expand({ cwd: options.base }, options.files);

        files.forEach(function(fileName) {
            var defaultName = /^(.*?)(?:\.[^\.]*)?$/.exec(fileName)[1];
            var filePath = path.join(options.base, fileName);
            loadFile(defaultName, filePath);
        });

        var loaded = [], loadIdByName = {}, loadNameById = {}, loadCntr = 0, usedNames = {};

        function moduleIdByName(name) {
            if (!hasProp(loadIdByName, name)) throw new Error("Module with name '"+ name +"' is not found.");
            return loadIdByName[name];
        }

        function isUsed(name) {
            return hasProp(usedNames, name) && usedNames[name];
        }

        function loadByName(name) {
            if (hasProp(defined, name)) {
                traverse(defined[name], true);
            } else {
                throw new Error("Undefined module: '" + name + "'");
            }
        }
        function loadDeps(module) {
            forEach(module.deps, loadByName);
        }

        function generateModuleId(name) {
            var bare = bareify(options.modulePrefix + name), i = 2;
            if (hasProp(loadNameById, bare)) {
                while (hasProp(loadNameById, bare + i)) {
                    i++;
                }
                bare = bare + i;
            }
            loadNameById[bare] = name;
            return bare;
        }


        var paths = [];
        function traverse(module, define) {
            var moduleId;
            if (define) {
                paths.push(module.name);
                if (hasProp(loadIdByName, module.name)) {
                    moduleId = loadIdByName[module.name];
                    var circle = list(paths, function(p) { return "'" + p + "'"; }).join(" -> ");
                    if (moduleId === PROCESSING) throw new Error("Circular dependency: " + circle);
                } else {
                    usedNames[module.name] = true;
                    moduleId = generateModuleId(module.name);
                    loadIdByName[module.name] = PROCESSING;
                    loadDeps(module);
                    loaded.push(module);
                    loadIdByName[module.name] = moduleId;
                }
                paths.pop();
            } else {
                loadDeps(module);
            }
        }

        required.forEach(function(m) {
            traverse(m, false);
        });

        forEach(exports, function(item) {
            loadByName(item.moduleName);
        });


        var outputString = options.generatedPrefix;
        function append(str) {
            outputString += str;
        }

        function buildDefinition(module) {
            if (typeof module.def === "function") {
                var depIds = list(module.deps, moduleIdByName);
                return "(" + String(module.def) + ")(" + depIds.join(', ') + ")";
            } else {
                return JSON.stringify(module.def, null, 4);
            }
        }
        loaded.forEach(function(module) {
            var moduleId = moduleIdByName(module.name);
            append("var " + moduleId + " = ");
            var built = buildDefinition(module);
            append(built + ";\n\n");
        });
        required.forEach(function(module) {
            var built = buildDefinition(module);
            append(built + ";\n\n");
        });

        forEach(exports, function(item) {
            var moduleId = moduleIdByName(item.moduleName);
            var exportName = JSON.stringify(item.exportName);
            append(options.exportContext + "[" + exportName + "] = " + moduleId + ";\n");
        });

        append(options.generatedSuffix);

        grunt.file.write(options.output, outputString);


        forEach(defined, function(module) {
            if (!isUsed(module.name)) {
                grunt.verbose.writeln("Unused module: '" + module.name + "'");
            }
        });
    });
};