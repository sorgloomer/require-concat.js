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