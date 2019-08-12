define([
	'require',
    'base/js/namespace',
    'base/js/events',
    './taskbar/taskbar',
    './utils',
    './taskbar/taskdecorator'
], function(
	require,
    Jupyter,
    events,
    tasktoolbar,
    utils,
    decorator
) {
    
    "use strict";

    function build_taskbar() {
    	console.log('building taskbar');
    	$('#taskbar-container').remove();
    	var toolbar_container = $(document.getElementsByClassName('toolbar-inner'));
        var taskbar_container = $('<div>').attr('id', 'taskbar-container');

        toolbar_container.append(taskbar_container);

        var taskbar = new tasktoolbar.TaskBar('#taskbar-container', {
            notebook: Jupyter.notebook,
            events: Jupyter.notebook.events,
            actions: Jupyter.actions});
    }

    function rebuild() {
    	build_taskbar();
    	decorator.decorate_tasks();
    }

    var load_ipython_extension = function () {  	

        if (Jupyter.notebook !== undefined && Jupyter.notebook._fully_loaded) {
        	utils.load_css('main.css');
        	build_taskbar();
        	decorator.decorate_tasks();
        	
        	events.on('new_task.Task', rebuild);
        }
    };

    return {
        load_ipython_extension : load_ipython_extension
    };
});