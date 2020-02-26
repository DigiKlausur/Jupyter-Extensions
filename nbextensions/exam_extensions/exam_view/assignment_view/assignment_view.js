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
    };

    var is_nbgrader_cell = function(cell) {
        return (cell.metadata.hasOwnProperty('nbgrader'));
    };

    var is_solution_cell = function(cell) {
        return is_nbgrader_cell(cell) && cell.metadata.nbgrader.solution;
    };

    var is_extra_cell = function(cell) {
        return is_solution_cell(cell) && cell.metadata.hasOwnProperty('extended_cell');
    };

    var add_highlight = function(cell) {
        if (cell.celltoolbar !== undefined) {
            if (!cell.celltoolbar.inner_element.hasClass(highlight)) {
                cell.celltoolbar.inner_element.addClass(highlight);
            }
        }
    };

    var add_hidden = function(cell) {
        if (cell.celltoolbar !== undefined) {
            if (!cell.celltoolbar.inner_element.hasClass(minimized)) {
                cell.celltoolbar.inner_element.addClass(minimized);
            }
        }
    };

    var remove_classes = function(cell) {
        if (cell.celltoolbar !== null && cell.celltoolbar !== undefined) {
            if (cell.celltoolbar.inner_element.hasClass(highlight)) {
                cell.celltoolbar.inner_element.removeClass(highlight);
            } else if (cell.celltoolbar.inner_element.hasClass(minimized)) {
                cell.celltoolbar.inner_element.removeClass(minimized);
            }
        }
    };

    var create_button = function(btn_text, btn_id, callback) {
        var btn = $('<button/>').attr('type', 'button').attr('id', btn_id)
                    .addClass('exam_btn').text(btn_text);
        btn.click(callback);
        return btn;
    };

    var create_header = function(div, cell, celltoolbar) {
        if (cell.cell_type === null) {
            setTimeout(function () {
                create_run_button(div, cell, celltoolbar);
            }, 100);
        } else {
            if (!is_solution_cell(cell)) {
                remove_classes(cell);
                add_hidden(cell);
                return;
            }
            var label = $('<span/>').append(cell.metadata.nbgrader.grade_id).addClass('cell_id');
            add_highlight(cell);
            $(div).append(label);
            if (is_extra_cell(cell)) {
                return;
            }
            if (cell.cell_type === 'code') {
                var btn = create_button('Run', 'run', function() {
                    cell.execute();
                });
                $(div).append($('<span/>').append(btn).addClass('cell_control'));
            } else if (cell.cell_type === 'markdown') {
                var edit_btn = create_button('Edit', 'edit', function() {
                        cell.events.trigger('select.Cell', {'cell': cell});
                        Jupyter.notebook.edit_mode();
                        celltoolbar.rebuild();
                    });
                var btn = create_button('Preview', 'preview', function() {
                    cell.execute();
                    celltoolbar.rebuild();
                });
                $(div).append($('<span/>').append(edit_btn).append(btn).addClass('cell_control'));
            }
        }
    };

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
        CellToolbar.register_callback('assignment_view.create_header', create_header);
        


        var preset = [
            'assignment_view.create_header',
        ];
        CellToolbar.register_preset(preset_name, preset, Jupyter.notebook);
        CellToolbar.activate_preset(preset_name);
    }

    return {
        'initialize': initialize
    };
});