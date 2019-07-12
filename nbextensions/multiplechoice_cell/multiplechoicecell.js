define([
    'jquery',
    'base/js/utils',
    'base/js/i18n',
    'notebook/js/cell',
    'notebook/js/textcell',
    'base/js/security',
    'services/config',
    'notebook/js/mathjaxutils',
    'notebook/js/celltoolbar',
    'components/marked/lib/marked',
    'codemirror/lib/codemirror',
    'codemirror/mode/gfm/gfm',
    'notebook/js/codemirror-ipythongfm',
    './cell_utils'
], function(
    $,
    utils,
    i18n,
    cell,
    textcell,
    security,
    configmod,
    mathjaxutils,
    celltoolbar,
    marked,
    CodeMirror,
    gfm,
    ipgfm,
    cell_utils
) {

    "use strict";

    var Cell = cell.Cell;
    var TextCell = textcell.TextCell;
    var MarkdownCell = textcell.MarkdownCell;

    var MultipleChoiceCell = function (options) {
        options = options || {};

        var config_default = utils.mergeopt(MarkdownCell, MultipleChoiceCell.options_default);
        this.class_config = new configmod.ConfigWithDefaults(options.config,
                                            config_default, 'MultipleChoiceCell');
        TextCell.apply(this, [$.extend({}, options, {config: options.config})]);

        this.cell_type = 'markdown';

        // Used to keep track of drag events
        this.drag_counter = 0;
    }


    MultipleChoiceCell.options_default = {
        cm_config: {
            mode: 'ipythongfm'
        },
        placeholder: ""
    };

    MultipleChoiceCell.prototype = Object.create(MarkdownCell.prototype);

    /**
     * Create the DOM element of the TextCell
     * @method create_element
     * @private
     */
    MultipleChoiceCell.prototype.create_element = function () {
        Cell.prototype.create_element.apply(this, arguments);
        var that = this;

        var cell = $("<div>").addClass('cell text_cell mc_cell');
        cell.attr('tabindex','2');

        var prompt = $('<div/>').addClass('prompt input_prompt');
        cell.append(prompt);
        var inner_cell = $('<div/>').addClass('inner_cell');

        this.celltoolbar = new celltoolbar.CellToolbar({
            cell: this, 
            notebook: this.notebook});
        inner_cell.append(this.celltoolbar.element);
        /////////
        var option_div = $('<div>').addClass('mc_options');
        option_div.append($('<span>').append('MultipleChoice').addClass('mc_label'));
        option_div.append($('<i>').addClass('fa-question-circle fa').attr('title', 'Multiple choice cells convert lines starting with a \'-\' to choices.'
            + '\nCheck multiselect if more than one option can be selected.'
            + '\nThe selected option(s) are stored in the metadata of the cell.'));

        var that = this;

        var type_selector = createInputElement('checkbox', 'mc_type', 'multiselect', 'multiselect', function () {
            if (this.checked) {
                set_multiselect(that);
            } else {
                unset_multiselect(that);
            }
            that.execute();
        });

        var select_div = $('<div>')
            .addClass('mc_select')
            .append(type_selector.addClass('mc_type'))
            .append(' multiselect');

        option_div.append(select_div);

        inner_cell.append(option_div);
        /////////

        var input_area = $('<div/>').addClass('input_area');
        this.code_mirror = new CodeMirror(input_area.get(0), this._options.cm_config);
        // In case of bugs that put the keyboard manager into an inconsistent state,
        // ensure KM is enabled when CodeMirror is focused:
        this.code_mirror.on('focus', function () {
            if (that.keyboard_manager) {
                that.keyboard_manager.enable();
            }
            that.code_mirror.setOption('readOnly', !that.is_editable());
        });
        this.code_mirror.on('keydown', $.proxy(this.handle_keyevent,this))
        // The tabindex=-1 makes this div focusable.
        var render_area = $('<div/>').addClass('text_cell_render rendered_html')
            .attr('tabindex','-1');
        inner_cell.append(input_area).append(render_area);
        cell.append(inner_cell);
        this.element = cell;
        this.inner_cell = inner_cell;
    };

    /**
     * @method render
     */
    MultipleChoiceCell.prototype.render = function () {
        this.drag_counter = 0;
        this.inner_cell.removeClass('dropzone');

        var cont = TextCell.prototype.render.apply(this);

        var result = get_choices(this);

        var that = this;
        var text = result.description;
        var math = null;
        //if (text === "") { text = MultipleChoiceCell.options_default.placeholder; }
        var text_and_math = mathjaxutils.remove_math(text);
        text = text_and_math[0];
        math = text_and_math[1];
        // Prevent marked from returning inline styles for table cells
        var renderer = new marked.Renderer();
        renderer.tablecell = function (content, flags) {
          var type = flags.header ? 'th' : 'td';
          var style = flags.align == null ? '': ' style="text-align: ' + flags.align + '"';
          var start_tag = '<' + type + style + '>';
          var end_tag = '</' + type + '>\n';
          return start_tag + content + end_tag;
        };
        marked(text, { renderer: renderer }, function (err, html) {
            html = mathjaxutils.replace_math(html, math);
            html = $(security.sanitize_html_and_parse(html));
            // add anchors to headings
            html.find(":header").addBack(":header").each(function (i, h) {
                h = $(h);
                var hash = h.text().replace(/ /g, '-');
                h.attr('id', hash);
                h.append(
                    $('<a/>')
                        .addClass('anchor-link')
                        .attr('href', '#' + hash)
                        .text('¶')
                        .on('click',function(){
                            setTimeout(function(){that.unrender(); that.render()}, 100)
                        })
                );
            });
            // links in markdown cells should open in new tabs
            html.find("a[href]").not('[href^="#"]').attr("target", "_blank");
            // replace attachment:<key> by the corresponding entry
            // in the cell's attachments
            html.find('img[src^="attachment:"]').each(function (i, h) {
              h = $(h);
              var key = h.attr('src').replace(/^attachment:/, '');

              if (that.attachments.hasOwnProperty(key)) {
                var att = that.attachments[key];
                var mime = Object.keys(att)[0];
                h.attr('src', 'data:' + mime + ';base64,' + att[mime]);
              } else {
                h.attr('src', '');
              }
            });
            that.set_rendered(html);
            that.typeset();
            that.events.trigger("rendered.MarkdownCell", {cell: that});
        });


        add_multiple_choice_input(this, result.choices);

        return cont;
    };

    var is_multiselect = function (cell) {
        return ((cell_utils.get_extended_type(cell) === 'multiplechoice') 
                && (cell_utils.get_extended_metadata(cell).multiselect));
    }

    var set_multiselect = function (cell) {
        cell_utils.get_extended_metadata(cell).multiselect = true;
    }

    var unset_multiselect = function (cell) {
        cell_utils.get_extended_metadata(cell).multiselect = false;
    }

    var select_option = function (cell, option) {
        var extended_metadata = cell_utils.get_extended_metadata(cell);

        if (extended_metadata.choices === undefined) {
            extended_metadata.choices = [];
        }
        if (is_multiselect(cell)) {
            extended_metadata.choices.push(option);
        } else {
            extended_metadata.choices = [option];
        }
    }

    var unselect_option = function (cell, option) {
        var index = $.inArray(option, cell_utils.get_extended_metadata(cell).choices);
        if (index > -1) {
            cell_utils.get_extended_metadata(cell).choices.splice(index, 1);
        }
    }

    var is_selected = function (cell, option) {
        var extended_metadata = cell_utils.get_extended_metadata(cell);
        return ((extended_metadata.choices !== undefined) 
                && ($.inArray(option, extended_metadata.choices) > -1));
    }

    var filter_options = function (cell, options) {
        var extended_metadata = cell_utils.get_extended_metadata(cell);
        if (extended_metadata === undefined) {
            return;
        }
        console.log(cell);
        var selected = extended_metadata.choices;

        choices = choices.filter(function (item) {
            return $.inArray(item, selected) > -1;
        });
    }

    var createInputElement = function(type, name, id, value, onChange) {
        var elem = $('<input/>').attr('type', type);
        elem.attr('id', id).attr('name', name).attr('value', value);
        elem.change(onChange);
        return elem
    };

    var createForm = function (cell, choices) {
        var form = $('<form>');
        var field = $('<fieldset>');
        var type;

        if (is_multiselect(cell)) {
            type = 'checkbox';
        } else {
            type = 'radio';
        }

        form.append(field);

        var extended_metadata = cell_utils.get_extended_metadata(cell);

        if ((extended_metadata !== undefined) 
            && (extended_metadata.choices !== undefined)) {

            var chosen = extended_metadata.choices;

            chosen = chosen.filter(function (item) {
                return $.inArray(item, choices) > -1;
            });

            cell_utils.get_extended_metadata(cell).choices = chosen;
        }
        
        for (var c in choices) {
            var choice = choices[c];
            var elem = createInputElement(type, 'mc_' + type, 'option_' + c, choice, function() {
                if (this.checked) {
                    select_option(cell, this.value);
                } else {
                    unselect_option(cell, this.value);
                }
                Jupyter.notebook.save_notebook();
            });
            
            if (is_selected(cell, choice)) {
                elem.prop('checked', true);
                if (!is_multiselect(cell)) {
                    select_option(cell, choice);
                }
            }
            field.append(elem);
            field.append(' ' + choice + '<br>');        
        }
        return form;    

    }

    var get_choices = function (cell) {
        var lines = cell.get_text().split('\n');

        var choices = [];
        var description = [];

        for (var i in lines) {
            var line = lines[i];
            if (line[0] === '-') {
                choices.push(line.slice(1));
            } else {
                description.push(line);
            }
        }

        description = description.join('\n');

        return {
            'choices': choices,
            'description': description
        }
    }

    var add_multiple_choice_input = function (cell, choices) {
        var form;

        form = createForm(cell, choices);
        cell.element.find('div.text_cell_render.rendered_html').append('<br>').append(form);
    }

    var multiplechoicecell = {
        MultipleChoiceCell: MultipleChoiceCell,
        is_multiselect: is_multiselect
    };

    return multiplechoicecell;

});