define([
    'base/js/utils',
    'base/js/events'
], function(utils, events) {
    
    "use strict";

    var is_task = function (cell) {
        return cell.metadata.task_id !== undefined;
    }

    var get_task_id = function (cell) {
        return cell.metadata.task_id;
    }

    var set_task_id = function (cell, id) {
        cell.metadata.task_id = id;
    }

    var same_task = function (cell0, cell1) {
        return is_task(cell0) && is_task(cell1) 
            && (get_task_id(cell0) == get_task_id(cell1));
    }

    var load_tasks = function (onSuccess) {
        utils.ajax('/tasks/api/load', {
            type: "GET",
            dataType: "json",
            success: onSuccess,
            error: function (jqXHR, status, error) {
                console.log('Error fetching tasks');
            }
        });
    }

    var save_task = function (name, cells) {
        var task = {
            'name': name,
            'cells': []
        };
        cells.forEach(function (cell) {
            var json_cell = {
                'type': cell.cell_type,
                'text': [cell.get_text()],
                'metadata': cell.metadata
            }
            task.cells.push(json_cell);
        });
        utils.ajax('/tasks/api/save', {
            type: "POST",
            dataType: "json",
            data: JSON.stringify(task),
            contentType: 'application/json',
            success: function (data, status, xhr) {
                console.log('success');
                events.trigger('new_task.Task');
            },
            error: function (jqXHR, status, error) {
                console.log('Error saving task');
            }
        });
    }

    return {
        is_task: is_task,
        get_task_id: get_task_id,
        set_task_id: set_task_id,
        same_task: same_task,
        load_tasks: load_tasks,
        save_task: save_task
    };

});