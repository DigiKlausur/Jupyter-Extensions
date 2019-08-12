define([
    'jquery',
    'require',
    'notebook/js/toolbar',
    'notebook/js/celltoolbar',
    'base/js/i18n',
    './taskeditor'
], function($, requirejs, toolbar, celltoolbar, i18n, taskeditor) {
    
    "use strict";

    var TaskBar = function (selector, options) {
        /**
         * Constructor
         *
         * Parameters:
         *  selector: string
         *  options: dictionary
         *      Dictionary of keyword arguments.
         *          events: $(Events) instance
         *          notebook: Notebook instance
         **/
        toolbar.ToolBar.apply(this, [selector, options] );
        this.events = options.events;
        this.notebook = options.notebook;
        this._make();
        Object.seal(this);
    };

    TaskBar.prototype = Object.create(toolbar.ToolBar.prototype);

    TaskBar.prototype._make = function () {
        var grps = [
         //['<import_snippets>'],
         ['<task_snippets>'],
         ['<new_task>']
        ];
        this.construct(grps);
    };

    TaskBar.prototype._pseudo_actions = {};

    //TaskBar.prototype._pseudo_actions.import_snippets = snippets.import_snippets;
    TaskBar.prototype._pseudo_actions.task_snippets = taskeditor.task_snippets;
    TaskBar.prototype._pseudo_actions.new_task = taskeditor.new_task;

    return {'TaskBar': TaskBar};
});