define([
    'base/js/namespace',
    './utils',
    './multiple_choice',
    './run_control'
], function(
    Jupyter,
    utils,
    mc,
    run_control
) {
    "use strict";

    var load_ipython_extension = function() {

        if (Jupyter.notebook !== undefined && Jupyter.notebook._fully_loaded) {
            utils.load_css('main.css');
            mc.init_multiple_choice_cells();
            run_control.initialize();
        }
    };

    return {
        load_ipython_extension : load_ipython_extension
    };
});