define([
    'require',
    'jquery',
    'base/js/namespace',
    'base/js/dialog',
    'notebook/js/celltoolbar',
    'base/js/events',
    'notebook/js/codecell'

], function (require, $, Jupyter, dialog, celltoolbar, events, codecell) {
    "use strict";

    var preset_name = "Assignment View";
    var CellToolbar = celltoolbar.CellToolbar;
    var highlight = 'highlight';
    var minimized = 'minimized';
    var CodeCell = codecell.CodeCell;

    // trigger an event when the toolbar is being rebuilt
    CellToolbar.prototype._rebuild = CellToolbar.prototype.rebuild;
    CellToolbar.prototype.rebuild = function () {
        events.trigger('toolbar_rebuild.CellToolbar', this.cell);
        this._rebuild();
    };

    // remove nbgrader class when the cell is either hidden or rebuilt
    events.on("global_hide.CellToolbar toolbar_rebuild.CellToolbar", function (evt, cell) {
        remove_classes(cell);
    });

    var is_editable = function(cell) {
        if (cell.metadata.editable === undefined) {
            return true;
        } else if (cell.metadata.editable) {
            return true;
        }
        return false;
    }

    var is_nbgrader_cell = function(cell) {
        return (cell.metadata.hasOwnProperty('nbgrader'));
    }

    var has_test = function(cell) {
        if (cell.metadata.hbrs_grader === undefined) {
            return false;
        } else if (cell.metadata.hbrs_grader.test === undefined) {
            return false;
        }
        return true;
    }

    var add_highlight = function(cell) {
        if (cell.celltoolbar !== undefined) {
            if (!cell.celltoolbar.inner_element.hasClass(highlight)) {
                cell.celltoolbar.inner_element.addClass(highlight);
            }
        }
    }

    var add_hidden = function(cell) {
        if (cell.celltoolbar !== undefined) {
            if (!cell.celltoolbar.inner_element.hasClass(minimized)) {
                cell.celltoolbar.inner_element.addClass(minimized);
            }
        }
    }

    var remove_classes = function(cell) {
        if (cell.celltoolbar !== null && cell.celltoolbar !== undefined) {
            if (cell.celltoolbar.inner_element.hasClass(highlight)) {
                cell.celltoolbar.inner_element.removeClass(highlight);
            } else if (cell.celltoolbar.inner_element.hasClass(minimized)) {
                cell.celltoolbar.inner_element.removeClass(minimized);
            }
        }
    }

    var execute_with_tests = function(cell, stop_on_error) {
        if (!cell.kernel) {
            console.log(i18n.msg._("Can't execute cell since kernel is not set."));
            return;
        }

        if (stop_on_error === undefined) {
            if (cell.metadata !== undefined && 
                    cell.metadata.tags !== undefined) {
                if (cell.metadata.tags.indexOf('raises-exception') !== -1) {
                    stop_on_error = false;
                } else {
                    stop_on_error = true;
                }
            } else {
               stop_on_error = true;
            }
        }

        cell.clear_output(false, true);
        var old_msg_id = cell.last_msg_id;
        if (old_msg_id) {
            cell.kernel.clear_callbacks_for_msg(old_msg_id);
            delete CodeCell.msg_cells[old_msg_id];
            cell.last_msg_id = null;
        }
        if (cell.get_text().trim().length === 0) {
            // nothing to do
            cell.set_input_prompt(null);
            return;
        }
        cell.set_input_prompt('*');
        cell.element.addClass("running");
        var callbacks = cell.get_callbacks();

        var output_header = "print('Your ouput:\\n')\n";
        var test_header = "\nprint('\\nValidation output:\\n')\n";

        var code = output_header + cell.get_text() + test_header + cell.metadata.hbrs_grader.test.join('');

        
        cell.last_msg_id = cell.kernel.execute(code, callbacks, {silent: false, store_history: true,
            stop_on_error : stop_on_error});
        CodeCell.msg_cells[cell.last_msg_id] = cell;
        cell.render();
        cell.events.trigger('execute.CodeCell', {cell: cell});
        var that = cell;
        function handleFinished(evt, data) {
            if (that.kernel.id === data.kernel.id && that.last_msg_id === data.msg_id) {
                    that.events.trigger('finished_execute.CodeCell', {cell: that});
                that.events.off('finished_iopub.Kernel', handleFinished);
              }
        }
        cell.events.on('finished_iopub.Kernel', handleFinished);

    }

    var create_button = function(btn_text, btn_id, callback) {
        var btn = $('<button/>').attr('type', 'button').attr('id', btn_id)
                    .addClass('exam_btn').text(btn_text);
        btn.click(callback);
        return btn;
    }

    var create_run_button = function(div, cell, celltoolbar) {
        if (cell.cell_type === null) {
            setTimeout(function () {
                create_run_button(div, cell, celltoolbar);
            }, 100);
        } else {
            
            if (!is_editable(cell) || !is_nbgrader_cell(cell)) {
                remove_classes(cell);
                add_hidden(cell);
                return;
            } 
            if (cell.metadata.nbgrader !== undefined) {
                var label = $('<span/>').append(cell.metadata.nbgrader.grade_id).addClass('cell_id');
                $(div).append(label);
            }


            if (cell.cell_type === 'code') {
                var btn = create_button('Run', 'run', function() {
                    cell.execute();
                });
                

                $(div).append($('<span/>').append(btn).addClass('cell_control'));
                add_highlight(cell);
            } else if (cell.cell_type === 'markdown') {
                var btn = create_button('Preview', 'preview', function() {
                    cell.execute();
                });
                var edit_btn = create_button('Edit', 'edit', function() {
                    cell.events.trigger('select.Cell', {'cell': cell});
                    Jupyter.notebook.edit_mode();
                    celltoolbar.rebuild();
                });
                $(div).append($('<span/>').append(edit_btn).append(btn).addClass('cell_control'));
                add_highlight(cell);
            }
        }
    }

    var create_validate_button = function(div, cell, celltoolbar) {
        if (cell.cell_type === null) {
            setTimeout(function () {
                create_validate_button(div, cell, celltoolbar);
            }, 100);
        } else {
            if (!is_editable(cell)  || !is_nbgrader_cell(cell)) {
                remove_classes(cell);
                add_hidden(cell);
                return;
            } else if (cell.cell_type === 'code' && has_test(cell)) {
                var btn = create_button('Validate', 'validate', function() {
                    execute_with_tests(cell);
                });
                $(div).append($('<span/>').append(btn).addClass('cell_control'));
                add_highlight(cell);
            }
        }
    }

    /**
     * Load custom css for the nbgrader toolbar.
     */
    var load_css = function () {
        var link = document.createElement('link');
        link.type = 'text/css';
        link.rel = 'stylesheet';
        link.href = require.toUrl('./assignment_view.css');
        document.getElementsByTagName('head')[0].appendChild(link);
    };

    var initialize = function () {
        load_css();
        CellToolbar.register_callback('assignment_view.run', create_run_button);
        CellToolbar.register_callback('assignment_view.validate', create_validate_button);


        var preset = [
            'assignment_view.run',
            'assignment_view.validate',
        ];
        CellToolbar.register_preset(preset_name, preset, Jupyter.notebook);
    }

    return {
        'initialize': initialize
    };
});