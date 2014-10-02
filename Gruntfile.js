module.exports = function(grunt) {

    require("load-grunt-tasks")(grunt);

    require("./tasks/requireConcat")(grunt);

    grunt.initConfig({
        requireConcat: {
            test1: {
                options: {
                    files: "**/*.js",
                    base: "tests/test1",
                    output: "dist/test1.js",
                    exports: "greeter"
                }
            },
            test2: {
                options: {
                    files: "**/*.js",
                    base: "tests/test2",
                    output: "dist/test2.js",
                    exports: ['sub.a', '.,-<=', 0, 1]
                }
            },
            "test-circ": {
                options: {
                    files: "**/*.js",
                    base: "tests/test-circ",
                    output: "dist/test-circ.js"
                }
            },
            calc: {
                options: {
                    files: "**/*.js",
                    base: "tests/calc",
                    output: "dist/calc.js",
                    exports: "calc"
                }
            }
        }
    });

    grunt.registerTask('default', ['requireConcat']);
};