define(function() {
    return "MOD A";
});

define('b', null, function() {
    return "MOD B unused :(";
});

define('sub.a', null, function() {
    return "MOD oa";
});

define('.,-<=', null, function() {
    return "MOD FURA";
});

define('0', ['.,-<=', 'sub.a'], function() {
    return "MOD 0";
});

define('1', '0', function() {
    return "MOD 1";
});
