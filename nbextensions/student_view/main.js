define([
    'base/js/namespace',
    './restricted_notebook/restricted_notebook',
    './run_control/run_control',
    './task_button/task_button',
    './exam_toolbar/exam_toolbar',
    './multiplechoice_cell/multiplechoice_cell'
], function(
    Jupyter,
    restricted_nb,
    run_control,
    task_button,
    exam_toolbar,
    mc_cell
) {

    "use strict";

    function displayLineNumbersByDefault() {
        Jupyter.notebook.get_cells().map(function(c) {
            if (c.cell_type === 'code') {
                c.code_mirror.setOption('lineNumbers', true);
            }
        });
        Jupyter.notebook.line_numbers = true;
    }

    function initialize() {
        restricted_nb.initialize();
        run_control.initialize();
        task_button.initialize();
        exam_toolbar.initialize();
        mc_cell.initialize();
        displayLineNumbersByDefault();
    }

    var load_ipython_extension = function () {
        return Jupyter.notebook.config.loaded.then(initialize);
    };

    return {
        load_ipython_extension : load_ipython_extension
    };
});
