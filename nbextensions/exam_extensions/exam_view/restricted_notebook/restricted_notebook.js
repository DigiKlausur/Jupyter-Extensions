define([
    'jquery',
	'base/js/namespace',
	'base/js/promises',
	'require',
	'./remap_keybindings'
], function($, Jupyter, promises, require, remap_keybindings) {

	var load_css = function () {
        var link = document.createElement("link");
        link.type = "text/css";
        link.rel = "stylesheet";
        link.href = require.toUrl("./restricted_notebook.css");
        document.getElementsByTagName("head")[0].appendChild(link);
    };

    var initialize = function () {
    	load_css();
    	remap_keybindings.remap();
    }

    return {
    	initialize: initialize
    }

});