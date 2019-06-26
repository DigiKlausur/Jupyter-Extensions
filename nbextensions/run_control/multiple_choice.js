define([
    'jquery',
    'base/js/namespace',
    'base/js/security',
    'notebook/js/textcell',
    'notebook/js/mathjaxutils',
    'components/marked/lib/marked',
    './utils'
], function(
    $,
    Jupyter,
    security,
    textcell,
    mathjaxutils,
    marked,
    utils
) {
    "use strict";

    var TextCell = textcell.TextCell;

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
                    cell.metadata.choice = this.value;
                }
            });
            
            if (cell.metadata.choice == choice) {
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
            if (line[0] == '-') {
                
                console.log("mc " + line.slice(1));
                choices.push(line.slice(1));
            } else {
                console.log(line);
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
        if (cell.metadata.egrader.mc_options === 'multiselect') {
            form = createCheckBoxForm(cell, choices);
        } else {
            form = createRadioForm(cell, choices);
        }
        cell.element.find('div.text_cell_render.rendered_html').append('<br>').append(form);
    }

    var patch_MarkdownCell_render = function (cell) {
        var old_render = cell.render;
        cell.render = function () {
            this.drag_counter = 0;
            this.inner_cell.removeClass('dropzone');

            console.log('new render');

            var cont = TextCell.prototype.render.apply(this);

            var result = get_choices(this);

            var that = this;
            var text = result.description;
            var math = null;
            if (text === "") { text = this.placeholder; }
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
        }
    }

    var init_multiple_choice_cells = function () {
        console.log('MC init');
        var cells = Jupyter.notebook.get_cells();
        for (var i in cells) {
            var cell = cells[i];
            if (utils.is_multiple_choice_cell(cell)) {
                patch_MarkdownCell_render(cell);
            }
        }
    }

    var mc = {
        init_multiple_choice_cells: init_multiple_choice_cells
    }

    return mc;

});