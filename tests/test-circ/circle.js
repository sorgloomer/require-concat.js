define("c1", ["c2"], function() {});
define("c2", ["c3"], function() {});
define("c3", ["c1"], function() {});
