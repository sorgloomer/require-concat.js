require('calc', function(calc) {
    calc.op['-'] = function(a, b) { return a - b; };
});

require('calc', function(calc) {
    calc.op['/'] = function(a, b) { return a / b; };
});
