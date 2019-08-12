define([
    'base/js/namespace',
    './../models/task_model'
], function(
    Jupyter,
    model
) {
    
    "use strict";

    var decorate_tasks = function() {
        var cells = Jupyter.notebook.get_cells();

        for (var i = 0; i < cells.length; i++) {
            var cell = cells[i];
            cell.element.removeClass('top_cell middle_cell bottom_cell');
            if (model.is_task(cell)) {
                cell.element
                    .addClass('task_cell')
                    .attr('id', model.get_task_id(cell));                
                if (i == 0 || model.get_task_id(cell) !== model.get_task_id(cells[i-1])) {
                    cell.element.addClass('top_cell');
                }
                if (i == cells.length - 1 || model.get_task_id(cell) !== model.get_task_id(cells[i+1])) {
                    cell.element.addClass('bottom_cell');
                }
            }
        }        
    }

    return {
        decorate_tasks: decorate_tasks
    };
});