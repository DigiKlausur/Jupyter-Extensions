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
    'notebook/js/codemirror-ipythongfm'
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
    ipgfm
    ) {
    "use strict";

    var Cell = cell.Cell;
    var TextCell = textcell.TextCell;
    var MarkdownCell = textcell.MarkdownCell;

    var MultipleChoiceCell = function (options) {
        //console.log('MC constructor');
        options = options || {};

        var config_default = utils.mergeopt(TextCell, MultipleChoiceCell.options_default);
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

    MultipleChoiceCell.prototype = Object.create(TextCell.prototype);

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

        var that = this;

        var type_selector = createInputElement('checkbox', 'mc_type', 'multiselect', 'multiselect', function () {
            if (this.checked) {
                that.metadata.extended_type_options = 'multiselect';
            } else {
                delete that.metadata.extended_type_options;
                if (that.metadata.choices !== undefined) {
                    that.metadata.choices = [that.metadata.choices[0]];
                }
            }
            that.execute();

        });

        console.log(that.metadata);
        console.log(that);

        if (that.metadata.extended_type_options === 'multiselect') {
            type_selector.prop('checked', true);
            console.log('WWWWWW');
        }

        var select_div = $('<div>')
            .addClass('mc_select')
            .append(type_selector.addClass('mc_type'))
            .append(' multiselect');

        //option_div.append(type_selector).append(' multiselect');
        option_div.append(select_div);

        //inner_cell.append(option_div);
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

    MultipleChoiceCell.prototype.select = function () {
        var cont = TextCell.prototype.select.apply(this, arguments);
        if (cont) {
            this.notebook.set_insert_image_enabled(!this.rendered);
        }
    };

    MultipleChoiceCell.prototype.unrender = function () {
        var cont = TextCell.prototype.unrender.apply(this);
        this.notebook.set_insert_image_enabled(true);
        // Clean choices
        delete this.metadata.choices;
    };

    MultipleChoiceCell.prototype.insert_inline_image_from_blob = function(blob) {
        /**
         * Insert markup for an inline image at the current cursor position.
         * This works as follow :
         * - We insert the base64-encoded blob data into the cell attachments
         *   dictionary, keyed by the filename.
         * - We insert an img tag with a 'attachment:key' src that refers to
         *   the attachments entry.
         *
         * Parameters:
         *  file: Blob
         *      The JS Blob object (e.g. from the DataTransferItem)
         */
        var that = this;
        var pos = this.code_mirror.getCursor();
        var reader = new FileReader();
        // We can get either a named file (drag'n'drop) or a blob (copy/paste)
        // We generate names for blobs
        var key;
        if (blob.name !== undefined) {
            key = encodeURIandParens(blob.name);
        } else {
            key = '_auto_' + Object.keys(that.attachments).length;
        }

        reader.onloadend = function() {
            var d = utils.parse_b64_data_uri(reader.result);
            if (blob.type != d[0]) {
                // TODO(julienr): Not sure what we should do in this case
                console.log('File type (' + blob.type + ') != data-uri ' +
                            'type (' + d[0] + ')');
            }
            that.add_attachment(key, blob.type, d[1]);
            var img_md = '![' + key + '](attachment:' + key + ')';
            that.code_mirror.replaceRange(img_md, pos);
        }
        reader.readAsDataURL(blob);
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

        /** @method bind_events **/
    MultipleChoiceCell.prototype.bind_events = function () {
        TextCell.prototype.bind_events.apply(this);
        var that = this;

        this.element.dblclick(function () {
            var cont = that.unrender();
            if (cont) {
                that.focus_editor();
            }
        });

        var attachment_regex = /^image\/.*$/;

        // Event handlers to allow users to insert image using either
        // drag'n'drop or copy/paste
        var div = that.code_mirror.getWrapperElement();
        $(div).on('paste', function(evt) {
            var data = evt.originalEvent.clipboardData;
            var items = data.items;
            if (data.items !== undefined) {
                for (var i = 0; i < items.length; ++i) {
                    var item = items[i];
                    if (item.kind == 'file' && attachment_regex.test(item.type)) {
                        // TODO(julienr): This does not stop code_mirror from pasting
                        // the filename.
                        evt.stopPropagation();
                        evt.preventDefault();
                        that.insert_inline_image_from_blob(item.getAsFile());
                    }
                }
            }
        });

        // Allow drag event if the dragged file can be used as an attachment
        // If we use this.code_mirror.on to register a "dragover" handler, we
        // get an empty dataTransfer
        this.code_mirror.on("dragover", function(cm, evt) {
            if (utils.dnd_contain_file(evt)) {
                evt.preventDefault();
            }
        });

        // We want to display a visual indicator that the drop is possible.
        // The dragleave event is fired when we hover a child element (which
        // is often immediatly after we got the dragenter), so we keep track
        // of the number of dragenter/dragleave we got, as discussed here :
        // https://stackoverflow.com/q/7110353/116067
        // This doesn't seem to be 100% reliable, so we clear the dropzone
        // class when the cell is rendered as well
        this.code_mirror.on("dragenter", function(cm, evt) {
            if (utils.dnd_contain_file(evt)) {
                that.drag_counter++;
                that.inner_cell.addClass('dropzone');
            }
            evt.preventDefault();
            evt.stopPropagation();
        });

        this.code_mirror.on("dragleave", function(cm, evt) {
            that.drag_counter--;
            if (that.drag_counter <= 0) {
                that.inner_cell.removeClass('dropzone');
            }
            evt.preventDefault();
            evt.stopPropagation();
        });

        this.code_mirror.on("drop", function(cm, evt) {
            that.drag_counter = 0;
            that.inner_cell.removeClass('dropzone');

            var files = evt.dataTransfer.files;
            for (var i = 0; i < files.length; ++i) {
                var file = files[i];
                if (attachment_regex.test(file.type)) {
                    // Prevent the default code_mirror 'drop' event handler
                    // (which inserts the file content) if this is a
                    // recognized media file
                    evt.stopPropagation();
                    evt.preventDefault();
                    that.insert_inline_image_from_blob(file);
                }
            }
        });
    };

    var createInputElement = function(type, name, id, value, onChange) {
        var elem = $('<input/>').attr('type', type);
        elem.attr('id', id).attr('name', name).attr('value', value);
        elem.change(onChange);
        return elem
    };

    var createCheckBoxForm = function(cell, choices) {
        
        var form = $('<form>');
        var field = $('<fieldset>');

        form.append(field);
        
        for (var c in choices) {
            var choice = choices[c];
            var checkbox = createInputElement('checkbox', 'mc_checkbox', 'option_' + c, choice, function() {
                if (cell.metadata.choices !== undefined) {
                    if (this.checked) {
                        cell.metadata.choices.push(this.value);
                    } else {
                        var index = $.inArray(this.value, cell.metadata.choices);
                        if (index > -1) {
                            cell.metadata.choices.splice(index, 1);
                        }
                    }
                } else {
                    if (this.checked) {
                        cell.metadata.choices = [this.value];
                    }
                }
                Jupyter.notebook.save_notebook();
            });
            
            if ($.inArray(choice, cell.metadata.choices) > -1) {
                checkbox.prop('checked', true);
            }
            field.append(checkbox);
            field.append(' ' + choice + '<br>');        
        }
        return form;    
    }

    var createRadioForm = function(cell, choices) {
    
        var form = $('<form>');
        var field = $('<fieldset>');

        form.append(field);
        
        for (var c in choices) {
            var choice = choices[c];
            var radio_btn = createInputElement('radio', 'mc_radio', 'option_' + c, choice, function() {
                if (this.checked) {
                    cell.metadata.choices = [this.value];
                }
                Jupyter.notebook.save_notebook();
            });
            
            if ($.inArray(choice, cell.metadata.choices) > -1) {
                radio_btn.prop('checked', true);
            }

            field.append(radio_btn);
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
        if (cell.metadata.extended_type_options === 'multiselect') {
            form = createCheckBoxForm(cell, choices);
        } else {
            form = createRadioForm(cell, choices);
        }
        cell.element.find('div.text_cell_render.rendered_html').append('<br>').append(form);
    }

    var multiplechoicecell = {
        MultipleChoiceCell: MultipleChoiceCell
    };

    return multiplechoicecell;

});