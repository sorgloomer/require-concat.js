require-concat.js
=================

A grunt task to transform JavaScript code using RequireJS not to require any loader code.

Feature
-------

Transforms this kind of code:
```
define('module1', ['module2'], function(m2) {
    // ... module 1
});
define('module2', [], function() {
    // ... module 2
});
require(['module3'], function(m3) {
    m3.doSomething();
    // ... entry
});
define('module3', ['module2'], function(m2) {
    // ... module 3
});
```
into this:
```
(function(context) {
    var module2 = (function(){
        // ... module 2
    })();

    var module3 = (function(m2){
        // ... module 3
    })(module2);

    var module1 = (function(m2){
        // ... module 1
    })(module2);

    (function(m3){
        m3.doSomething();
        // ... entry
    })(module3);

    // Optionally:
    context["module1"] = module1;
})(this);
```

Remarks
-------

Works only with top-level dependencies.

TODO