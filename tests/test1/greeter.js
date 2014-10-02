define("welcome", function(w) {
    return function(str) {
        return w.replace("{}", str);
    };
});