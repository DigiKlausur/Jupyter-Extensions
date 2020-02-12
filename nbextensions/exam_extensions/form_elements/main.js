define([
    'base/js/namespace',
    'base/js/events',
    'notebook/js/textcell',
    'require'
], function(
    Jupyter,
    events,
    textcell,
    require
) {

    "use strict";

    var MarkdownCell = textcell.MarkdownCell;

    var form_metadata = 'form_cell';

    var is_form_cell = function (cell) {
        return cell.metadata.hasOwnProperty(form_metadata);
    };

    var is_multiplechoice_cell = function (cell) {
        return is_form_cell(cell) && cell.metadata[form_metadata].type == 'multiplechoice';
    };

    var is_singlechoice_cell = function (cell) {
        return is_form_cell(cell) && cell.metadata[form_metadata].type == 'singlechoice';
    };

    var is_choice_cell = function (cell) {
        return is_singlechoice_cell(cell) || is_multiplechoice_cell(cell);
    };

    var get_choices = function(cell) {
        if (is_choice_cell) {
            if (cell.metadata[form_metadata].hasOwnProperty('choice')) {
                return cell.metadata[form_metadata].choice;
            }
        }
        return [];
    };

    var create_input = function(type, name, value, selected, onChange) {
        var input = $('<input>')
                        .attr('type', type)
                        .attr('name', name)
                        .attr('value', value)
                        .change(onChange);
        if (selected) {
            input.attr('checked', 'checked');
        }
        return input;
    }

    var make_radio = function (cell) {
        var in_area = $(cell.element).find('.rendered_html');
        var lists = in_area.find('ul');
        var choices = get_choices(cell);
        if (lists.length > 0) {
            var list = lists[0];
            var form = $('<form>').addClass('hbrs_radio');
            var items = $(list).find('li');
            for (var i=0; i<items.length; i++) {

                var input = create_input('radio', 'my_radio', i, choices.indexOf(i.toString()) >= 0, function () {
                    cell.metadata[form_metadata].choice = [this.value];
                });

                form.append($('<div>')
                            .append(input)
                            .append('&nbsp;&nbsp;')
                            .append(items[i].childNodes));
            };
            $(list).replaceWith(form);
        }
    };

    var make_checkboxes = function (cell) {
        var lists = $(cell.element).find('ul');
        var choices = get_choices(cell);
        if (lists.length > 0) {
            var list = lists[0];
            var form = $('<form>').addClass('hbrs_checkbox');
            var items = $(list).find('li');
            for (var i=0; i<items.length; i++) {
                var input = create_input('checkbox', 'my_checkbox', i, choices.indexOf(i.toString()) >= 0, function () {
                    if (this.checked) {
                        var cur_choices = get_choices(cell);
                        cur_choices.push(this.value);
                        cell.metadata[form_metadata].choice = cur_choices;
                    } else {
                        var index = get_choices(cell).indexOf(this.value);
                        if (index > -1) {
                            cell.metadata[form_metadata].choice.splice(index, 1);
                        }
                    }
                });
                form.append($('<div>')
                            .append(input)
                            .append('&nbsp;&nbsp;')
                            .append(items[i].childNodes));
            };
            $(list).replaceWith(form);
        }
    };

    function render_form_cells() {
        var cells = Jupyter.notebook.get_cells();
        for (var i in cells) {
            var cell = cells[i];
            // Rerender rendered form cells
            if (is_form_cell(cell) && cell.rendered) {
                cell.unrender_force();
                cell.render();
            }
        }
    };

    function render_form_cells_asap() {
        if (Jupyter.notebook && Jupyter.notebook.kernel && Jupyter.notebook.kernel.info_reply.status == 'ok') {
            render_form_cells();
        }
        events.on('kernel_ready.Kernel', render_form_cells);
    };

    var patch_MarkdownCell_render = function () {
        var old_render = MarkdownCell.prototype.render;
        MarkdownCell.prototype.render = function () {
            old_render.apply(this, arguments);
            if (is_singlechoice_cell(this)) {
                make_radio(this);
            } else if (is_multiplechoice_cell(this)) {
                make_checkboxes(this);
            }
        }
    };

    var patch_MarkdownCell_unrender = function () {
        var old_unrender = MarkdownCell.prototype.unrender;
        MarkdownCell.prototype.unrender_force = old_unrender;
        MarkdownCell.prototype.unrender = function () {
            if (is_form_cell(this)) {

            } else {
                old_unrender.apply(this, arguments);
            }
        }
    };

    function load_css() {
        var link = document.createElement("link");
        link.type = "text/css";
        link.rel = "stylesheet";
        link.href = require.toUrl("./forms.css");
        document.getElementsByTagName("head")[0].appendChild(link);
    };

    function initialize() {
        load_css();
        patch_MarkdownCell_render();
        patch_MarkdownCell_unrender();
        render_form_cells();
    };

    var load_ipython_extension = function () {
        return Jupyter.notebook.config.loaded.then(initialize);
    };

    return {
        load_ipython_extension : load_ipython_extension
    };
});
