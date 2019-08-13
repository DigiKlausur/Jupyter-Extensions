define([
	'jquery',
	'base/js/namespace',
	'base/js/dialog',
	'base/js/events',
	'./../models/nbgrader_model',
	'./../models/task_model'
], function (
	$,
	Jupyter,
	dialog,
	events,
	nbgrader,
	model,
) {

	var tasks_snippets = {};

    function randomString(length) {
        var result = '';
        var chars = 'abcdef0123456789';
        var i;
        for (i=0; i < length; i++) {
            result += chars[Math.floor(Math.random() * chars.length)];
        }
        return result;
    };

	function new_task_dialog () {
		var cells = Jupyter.notebook.get_selected_cells();

		var body = $('<div>')
			.append('Name ')
			.append($('<input>')
				.attr('type', 'text')
				.attr('id', 'task_name'))
			.append('</br>');

		var index = 1;

		cells.forEach(function (cell) {
			var div = $('<div>');

			var header = $('<p>')
				.append('</br>')
				.append(index++)
				.append(': ')
				.append(cell.cell_type.charAt(0).toUpperCase() + cell.cell_type.slice(1))
				.append(' Cell');
			
			div.append(header);
			div.append($('<pre>').append(cell.get_text()));
			body.append(div);

		});

		dialog.modal({
			keyboard_manager: Jupyter.keyboard_manager,
			title: 'Create new snippet preset',
			body: body,
			buttons: {
				OK: {
					click: function () {
						var name = $('#task_name').val();
						model.save_task(name, cells);
					}
				},
				Cancel: {}
			}
		})

	}

	function insert_task_dialog (task) {

		var body = $('<div>')
			.append('Name ')
			.append($('<input>')
				.attr('type', 'text')
				.attr('id', 'task_name')
				.attr('value', 'task_' + randomString(6)))
			.append('</br>');

		dialog.modal({
			keyboard_manager: Jupyter.keyboard_manager,
			title: 'Please name your task',
			body: body,
			buttons : {
				OK: {
					click: function () {
						var name = $('#task_name').val();
						console.log(name);
						if (name.length > 0) {
							insert_task(task, name);
						} else {
							alert('The name can\'t be empty!');
						}
					}
				},
				Cancel : {}
			}
		});
    }

    function get_cell_index(cell) {
	    for (var i=0;i < Jupyter.notebook.ncells();i++) {
	        var current = Jupyter.notebook.get_cell(i);
	        if (current === cell) {
	            return i;
	        } 
	    }
	    return -1;
	}

    function select_insert_point() {
    	var index = get_cell_index(Jupyter.notebook.get_selected_cell());
    	var ncells = Jupyter.notebook.ncells();

    	while (index + 1 < ncells && model.same_task(
    			Jupyter.notebook.get_cell(index),
    			Jupyter.notebook.get_cell(index + 1))) {
    		index++;
    	}

    	Jupyter.notebook.select(index);
    }

    function insert_task (task, name) {

    	select_insert_point();

    	var readonly = 0;

    	task.cells.forEach(function (task_cell) {
            var cell = Jupyter.notebook.insert_cell_below(task_cell.type);
            cell.set_text(task_cell.text.join('\n'));
            if (task_cell.metadata !== undefined) {
                cell.metadata = task_cell.metadata;
            }
            cell.metadata.task_id = name;

            // Set nbgrader id
            if (nbgrader.is_solution(cell) && nbgrader.is_grade(cell)) {
            	nbgrader.set_grade_id(cell, name);
            } else if (nbgrader.is_solution(cell) && cell.cell_type === 'code') {
            	nbgrader.set_grade_id(cell, name);
            } else if (nbgrader.is_grade(cell) && cell.cell_type === 'code') {
            	var id = 'test_' + name;
            	nbgrader.set_grade_id(cell, id);
            	console.log('test');
            } else if (nbgrader.is_locked(cell)) {
            	var id = 'Description' + readonly + '_' + name;
            	readonly++;
            	nbgrader.set_grade_id(cell, id);
            	console.log('description');
            } 
            if (cell.type === 'markdown') {
                cell.render();
            }
            cell.focus_cell();
        });
        Jupyter.CellToolbar.rebuild_all();
        events.trigger('new_task.Task');
    }


	var new_task = function () {
		var button = $('<button>')
			.append('Save Task Preset')
			.addClass('btn btn-default')
			.click(function () {
				new_task_dialog();
			});

		return button;
	}

	var task_snippets = function () {
        var dropdown = $('<select>')
            .attr('id', 'task_picker')
            .addClass('form-control select-xs')
            .change(function () {
                var selected = $('select#task_picker').find(':selected');
                if (selected.attr('name') !== 'header') {
                    var task = task_snippets[selected.attr('id')];
                    console.log(task);
                    console.log(task.cells);
                    insert_task_dialog(task);

                    $('option#task_header').prop('selected', true);
                }
            });

        dropdown
            .append($('<option>')
                .attr('id', 'task_header')
                .text('Insert Task'));

        model.load_tasks(function (data, status, xhr) {
        	var tasks = data.tasks;
        	for (var k in tasks) {
        		var task = tasks[k];
        		task_snippets[task.name] = task;
				var option = $('<option>')
            		.attr('id', task.name)
            		.text(task.name);
            	dropdown.append(option);            		
        	}
        });
        return dropdown;
    }

	return {
		new_task: new_task,
		task_snippets: task_snippets
	}

});