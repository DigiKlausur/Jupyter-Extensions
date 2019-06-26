define([
    'base/js/namespace'
], function(
    Jupyter
) {
    "use strict";

    var is_init_cell = function (cell) {
        if (cell.metadata.run_control === undefined) {
            return false;
        }
        return (cell.cell_type === 'code' && cell.metadata.run_control.init_cell);
    }

    var is_hidden_input_cell = function (cell) {
        if (cell.metadata.run_control === undefined) {
            return false;
        }
        return (cell.metadata.run_control.hide_input);
    }

    var is_hidden_cell = function (cell) {
        if (cell.metadata.run_control === undefined) {
            return false;
        }
        return (cell.metadata.run_control.hide_cell);
    }

    var is_frozen_cell = function (cell) {
        if (cell.metadata.run_control === undefined) {
            return false;
        }
        return (cell.metadata.run_control.frozen);
    }

    var is_multiple_choice_cell = function (cell) {
        if (cell.metadata.egrader === undefined) {
            return false;
        }
        return (cell.metadata.egrader.type === 'multiple_choice' &&
                cell.cell_type === 'markdown');
    }

    var load_css = function(name) {
        var link = document.createElement("link");
        link.type = "text/css";
        link.rel = "stylesheet";
        link.href = require.toUrl("./" + name);
        document.getElementsByTagName("head")[0].appendChild(link);
    };


    var get_cell_by_id = function (id) {
        var cells = Jupyter.notebook.get_cells();
        for (var i in cells) {
            var cell = cells[i];
            if (cell.metadata.cell_id === id) {
                return cell;
            }
        }
        return null;
    }


    var utils = {
        is_init_cell: is_init_cell,
        is_hidden_input_cell: is_hidden_input_cell,
        is_hidden_cell: is_hidden_cell,
        is_frozen_cell: is_frozen_cell,
        is_multiple_choice_cell: is_multiple_choice_cell,
        load_css: load_css,
        get_cell_by_id: get_cell_by_id
    }

    return utils;
});