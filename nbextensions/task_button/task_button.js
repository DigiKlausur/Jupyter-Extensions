define([
	'jquery',
    'require',
    'base/js/namespace',
    'base/js/events',
], function(
	$,
    require,
    Jupyter,
    events
) {

    "use strict";
    
    var base_url;

    function set_base_url() {
        var current = window.location.href;
        var name = Jupyter.notebook.notebook_name;
        base_url = current.substring(0, current.length - name.length);
        console.log(base_url);
    }

    function is_taskbook() {
        return (Jupyter.notebook.metadata.taskbook !== undefined);
    }

    function load_css() {
        var link = document.createElement("link");
        link.type = "text/css";
        link.rel = "stylesheet";
        link.href = require.toUrl("./task_button.css");
        document.getElementsByTagName("head")[0].appendChild(link);
    };

    function register_button_actions() {
        var prev = Jupyter.notebook.metadata.taskbook.prev;
        var next = Jupyter.notebook.metadata.taskbook.next;
        console.log(prev);
        console.log(next);

        if (prev !== undefined) {
            $('#prev_task')
                .prop('disabled', false)
                .click(function () {
                    button_callback(prev);
                });
        }
        if (next !== undefined) {
            $('#next_task')
                .prop('disabled', false)
                .click(function () {
                    button_callback(next);
                });
        }
    }

    function button_callback(link) {
        Jupyter.notebook.save_checkpoint();
        events.on('notebook_saved.Notebook', function () {
            window.location.href = base_url + link + ".ipynb";
        })
    }

    function create_taskbar() {
        if (!is_taskbook()) {
            return;
        }
    	var prev = $('<button>')
            .attr('id', 'prev_task')
            .prop('disabled', true)
            .append($('<i>').addClass('fa fa-arrow-left'))
            .append(' Previous Task')
            .addClass('task_button');

        var next = $('<button>')
            .attr('id', 'next_task')
            .prop('disabled', true)
            .append('Next Task ')
            .append($('<i>').addClass('fa fa-arrow-right'))
            .addClass('task_button');

        var text = $('<span>')
        	.attr('id', 'task_title')
            .append(Jupyter.notebook.notebook_name.split('.ipynb')[0]);

        var div = $('<div>')
            .attr('id', 'taskbar')
            .attr('tabindex', -1)
            .append(prev)
            .append(text)
            .append(next);

        $('#maintoolbar').after(div);
        register_button_actions();
    }

    function initialize() {
        console.log('Load task_button');
        load_css();
        set_base_url();
        create_taskbar();
    }

    return {
        initialize: initialize
    };
});