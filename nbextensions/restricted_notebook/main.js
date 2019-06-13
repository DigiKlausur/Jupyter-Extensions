define([
    'jquery',
	'base/js/namespace',
	'base/js/promises',
	'require',
	'./remap_keybindings'
], function($, Jupyter, promises, require, remap_keybindings) {

	var load_css = function() {
        var link = document.createElement("link");
        link.type = "text/css";
        link.rel = "stylesheet";
        link.href = require.toUrl("./main.css");
        document.getElementsByTagName("head")[0].appendChild(link);
    };

    promises.app_initialized.then(function(appname) {
        if (appname == 'NotebookApp') {
            console.log('NotebookApp loaded!');

            

            load_css();
            console.log('CSS loaded!');
            $("<span id='notebook_title'>" + Jupyter.notebook.get_notebook_name() + "</span>")
                .insertBefore(".save_widget");
            remap_keybindings.remap();
        }
    });

});