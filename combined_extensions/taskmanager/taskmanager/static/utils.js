define([
	'require'
], function(
	require
) {
    
    "use strict";

    var load_css = function(css) {
        var link = document.createElement("link");
        link.type = "text/css";
        link.rel = "stylesheet";
        link.href = require.toUrl("./" + css);
        document.getElementsByTagName("head")[0].appendChild(link);
    };

    return {
        load_css: load_css
    };
});