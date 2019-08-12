define([
    'jquery',
    'base/js/namespace',
    'base/js/dialog'
], function ($, Jupyter, dialog, celltoolbar) {
    "use strict";

    function randomString(length) {
        var result = '';
        var chars = 'abcdef0123456789';
        var i;
        for (i=0; i < length; i++) {
            result += chars[Math.floor(Math.random() * chars.length)];
        }
        return result;
    };

    function to_float(val) {
        if (val === undefined || val === "") {
            return 0;
        }
        return parseFloat(val);
    };

    var update_total = function() {
        var total_points = 0;
        var cells = Jupyter.notebook.get_cells();
        for (var i=0; i < cells.length; i++) {
            if (is_grade(cells[i])) {
                total_points += to_float(cells[i].metadata.nbgrader.points);
            }
        }
        $("#nbgrader-total-points").attr("value", total_points);
    };

    var validate_ids = function() {
        var elems, set, i, label;

        if (warning !== undefined) {
            return;
        }

        var valid = /^[a-zA-Z0-9_\-]+$/;
        var modal_opts = {
            notebook: Jupyter.notebook,
            keyboard_manager: Jupyter.keyboard_manager,
            buttons: {
                OK: {
                    class: "btn-primary",
                    click: function () {
                        warning = undefined;
                    }
                }
            }
        };

        elems = $(".nbgrader-id-input");
        set = new Object();
        for (i = 0; i < elems.length; i++) {
            label = $(elems[i]).val();
            if (!valid.test(label)) {
                modal_opts.title = "Invalid nbgrader cell ID";
                modal_opts.body = "At least one cell has an invalid nbgrader ID. Cell IDs must contain at least one character, and may only container letters, numbers, hyphens, and/or underscores.";
                warning = dialog.modal(modal_opts);
                break;
            } else if (label in set) {
                modal_opts.title = "Duplicate nbgrader cell ID";
                modal_opts.body = "The nbgrader ID \"" + label + "\" has been used for more than one cell. Please make sure all grade cells have unique ids.";
                warning = dialog.modal(modal_opts);
                break;
            } else {
                set[label] = true;
            }
        }
    };

    /**
     * Remove all nbgrader metadata
     */
    var remove_metadata = function (cell) {
        if (cell.metadata.hasOwnProperty("nbgrader")) {
            delete cell.metadata.nbgrader;
        }
    };

    /**
     * Set nbgrader schema version
     */
    var set_schema_version = function (cell) {
        if (cell.metadata.nbgrader === undefined) {
            cell.metadata.nbgrader = {};
        }
        cell.metadata.nbgrader.schema_version = 1;
    };

    /**
     * Is the cell a solution cell?
     */
    var is_solution = function (cell) {
        if (cell.metadata.nbgrader === undefined) {
            return false;
        } else if (cell.metadata.nbgrader.solution === undefined) {
            return false;
        } else {
            return cell.metadata.nbgrader.solution;
        }
    };

    /**
     * Set whether this cell is or is not a solution cell.
     */
    var set_solution = function (cell, val) {
        if (cell.metadata.nbgrader === undefined) {
            cell.metadata.nbgrader = {};
        }
        cell.metadata.nbgrader.solution = val;
    };

    /**
     * Is the cell a grade cell?
     */
    var is_grade = function (cell) {
        if (cell.metadata.nbgrader === undefined) {
            return false;
        } else if (cell.metadata.nbgrader.grade === undefined) {
            return false;
        } else {
            return cell.metadata.nbgrader.grade;
        }
    };

    /**
     * Set whether this cell is or is not a grade cell.
     */
    var set_grade = function (cell, val) {
        if (cell.metadata.nbgrader === undefined) {
            cell.metadata.nbgrader = {};
        }
        cell.metadata.nbgrader.grade = val;
        if (val === false && cell.metadata.nbgrader.hasOwnProperty("points")) {
            delete cell.metadata.nbgrader.points;
        }
    };

    var get_points = function (cell) {
        if (cell.metadata.nbgrader === undefined) {
            return 0;
        } else {
            return to_float(cell.metadata.nbgrader.points);
        }
    };

    var set_points = function (cell, val) {
        if (cell.metadata.nbgrader === undefined) {
            cell.metadata.nbgrader = {};
        }
        var points = to_float(val);
        if (points < 0) points = 0;
        cell.metadata.nbgrader.points = points;
    };

    var get_grade_id = function (cell) {
        if (cell.metadata.nbgrader === undefined) {
            return "cell-" + randomString(16);
        } else if (cell.metadata.nbgrader.grade_id === undefined) {
            return "cell-" + randomString(16);
        } else {
            return cell.metadata.nbgrader.grade_id;
        }
    };

    var set_grade_id = function (cell, val) {
        if (cell.metadata.nbgrader === undefined) {
            cell.metadata.nbgrader = {};
        }
        if (val === undefined) {
            cell.metadata.nbgrader.grade_id = '';
        } else {
            cell.metadata.nbgrader.grade_id = val;
        }
    };

    var is_locked = function (cell) {
        if (is_solution(cell)) {
            return false;
        } else if (is_grade(cell)) {
            return true;
        } else if (cell.metadata.nbgrader === undefined) {
            return false;
        } else if (cell.metadata.nbgrader.locked === undefined) {
            return false;
        } else {
            return cell.metadata.nbgrader.locked;
        }
    };

    var set_locked = function (cell, val) {
        if (cell.metadata.nbgrader === undefined) {
            cell.metadata.nbgrader = {};
        }
        if (is_solution(cell)) {
            cell.metadata.nbgrader.locked = false;
        } else if (is_grade(cell)) {
            cell.metadata.nbgrader.locked = true;
        } else {
            cell.metadata.nbgrader.locked = val;
        }
    };

    return {
    	update_total: update_total,
    	validate_ids: validate_ids,
    	remove_metadata: remove_metadata,
    	set_schema_version: set_schema_version,
    	is_solution: is_solution,
    	set_solution: set_solution,
    	is_grade: is_grade,
    	set_grade: set_grade,
    	get_points: get_points,
    	set_points: set_points,
    	get_grade_id: get_grade_id,
    	set_grade_id: set_grade_id,
    	is_locked: is_locked,
    	set_locked: set_locked
    }


});