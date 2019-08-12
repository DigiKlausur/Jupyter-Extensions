define([
	'require',
    'base/js/namespace',
    './prototypes',
    './select'
], function(
	require,
    Jupyter,
    prototypes,
    select
) {
    
    "use strict";

    var is_multiplechoice_cell = function (cell) {
    	return (cell.cell_type === 'markdown') && (cell.metadata.extended_type !== undefined) && (cell.metadata.extended_type === 'multiplechoice');
    }

    var init_cells = function () {
    	for (var i=0; i < Jupyter.notebook.ncells(); i++) {
    		var old_cell = Jupyter.notebook.get_cell(i);
    		if (is_multiplechoice_cell(old_cell)) {
    			Jupyter.notebook.to_multiplicechoice(i);
    			var new_cell = Jupyter.notebook.get_cell(i);
    			if (new_cell.metadata.extended_type_options === 'multiselect') {
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

    var initialize = function () {
        load_css();
        prototypes.patch_prototypes();
        select.register();
        init_cells();
    }

    return {
        initialize: initialize
    };
});