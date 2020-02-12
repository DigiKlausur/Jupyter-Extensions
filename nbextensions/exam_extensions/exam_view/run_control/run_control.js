define([
    'base/js/namespace',
    'base/js/events',
    'notebook/js/codecell',
    'notebook/js/textcell',
    './utils'
], function(
    Jupyter,
    events,
    codecell,
    textcell,
    utils
) {

    "use strict";

    var CodeCell = codecell.CodeCell;
    var MarkdownCell = textcell.MarkdownCell;

    var patch_MarkdownCell_unrender = function () {
        console.log('[Freeze] patching MarkdownCell.prototype.unrender');
        var old_unrender = MarkdownCell.prototype.unrender;

        MarkdownCell.prototype.unrender = function () {
            // console.log('[Freeze] patched unrender applied');
            if (!utils.is_frozen_cell(this)) {
                old_unrender.apply(this, arguments);
            }
        };
    }

    var patch_CodeCell_execute = function () {
        console.log('[Freeze] patching CodeCell.prototype.execute');
        var old_execute = CodeCell.prototype.execute;

        CodeCell.prototype.execute = function () {
            if (!utils.is_frozen_cell(this)) {
                old_execute.apply(this, arguments);
            }
        };
    }

    var run_init_cells = function () {
        console.log('Run init');
        var cells = Jupyter.notebook.get_cells();
        for (var i in cells) {
            var cell = cells[i];
            if (utils.is_init_cell(cell) || cell.cell_type === 'markdown') {
                cell.execute();
            }
        }
    }

    var run_init_cells_asap = function () {
        if (Jupyter.notebook && Jupyter.notebook.kernel && Jupyter.notebook.kernel.info_reply.status === 'ok') {
            // kernel is already ready
            run_init_cells();
        }
        // whenever a (new) kernel  becomes ready, run all initialization cells
        events.on('kernel_ready.Kernel', run_init_cells);
    }

    var update_visibility = function () {
        Jupyter.notebook.get_cells().forEach(function(cell) {
            if (utils.is_hidden_cell(cell)) {
                cell.element.hide();
            } else if (utils.is_hidden_input_cell(cell)) {
                cell.element.find("div.input").hide();
            }
        })
    };

    var initialize = function () {
        update_visibility();
        run_init_cells_asap();
        patch_MarkdownCell_unrender();
        patch_CodeCell_execute();
    }

    var run_control = {
        update_visibility: update_visibility,
        run_init_cells_asap: run_init_cells_asap,
        patch_CodeCell_execute: patch_CodeCell_execute,
        patch_MarkdownCell_unrender: patch_MarkdownCell_unrender,
        initialize: initialize
    }

    return run_control;
});
