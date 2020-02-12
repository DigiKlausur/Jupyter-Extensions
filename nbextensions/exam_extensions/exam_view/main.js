define([
    'base/js/namespace',
    './assignment_view/assignment_view',
    './run_control/run_control',
    './restricted_notebook/restricted_notebook'
], function(
    Jupyter,
    exam_toolbar,
    run_control,
    restricted_notebook
) {

    "use strict";

    function initialize() {
        exam_toolbar.initialize();
        run_control.initialize();
        restricted_notebook.initialize();
    }

    var load_ipython_extension = function () {
        return Jupyter.notebook.config.loaded.then(initialize);
    };

    return {
        load_ipython_extension : load_ipython_extension
    };
});
