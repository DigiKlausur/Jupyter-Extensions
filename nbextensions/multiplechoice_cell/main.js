define([
	'require',
    'base/js/namespace',
    './prototypes',
    './typeselect',
    './cell_utils',
    './multiplechoicecell'
], function(
	require,
    Jupyter,
    prototypes,
    typeselect,
    cell_utils,
    multiplechoicecell
) {
    
    "use strict";

    var is_multiplechoice_cell = function (cell) {
    	return cell_utils.get_extended_type(cell) === 'multiplechoice';
    }


    var init_cells = function () {
    	for (var i=0; i < Jupyter.notebook.ncells(); i++) {
    		var old_cell = Jupyter.notebook.get_cell(i);
    		if (cell_utils.get_extended_type(old_cell) === 'multiplechoice') {
    			Jupyter.notebook.to_multiplicechoice(i);
    			var new_cell = Jupyter.notebook.get_cell(i);
    			if (multiplechoicecell.is_multiselect(new_cell)) {
    				new_cell.element.find('.mc_type').prop('checked', true);
    			}
    		}
    	}
    }

    var load_css = function() {
        var link = document.createElement("link");
        link.type = "text/css";
        link.rel = "stylesheet";
        link.href = require.toUrl("./main.css");
        document.getElementsByTagName("head")[0].appendChild(link);
    };

    var load_ipython_extension = function () {  	

        if (Jupyter.notebook !== undefined && Jupyter.notebook._fully_loaded) {
        	load_css();
            console.log('Started MultipleChoice Extension');
            prototypes.patch_prototypes();
            console.log('Registered MultipleChoice cell type.');
            typeselect.register_menu();
            init_cells();
        }
    };

    return {
        load_ipython_extension : load_ipython_extension
    };
});