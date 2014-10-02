require('calc', function(calc) {
    calc.op['+'] = function(a, b) { return a + b; };
});

require('calc', function(calc) {
    calc.op['*'] = function(a, b) { return a * b; };
});

define('calc', null, function() {
    var calc = {
        op: {},
        process: function (op, a, b) {
            return calc.op[op](a, b);
        }
    };
    return calc;
});