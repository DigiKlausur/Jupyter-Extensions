define([
	'base/js/namespace',
    'notebook/js/textcell',
    'notebook/js/codecell',
    'notebook/js/cell',
    './multiplechoicecell',
    './cell_utils'
], function (
	Jupyter,
	textcell,
	codecell,
	cellmod,
	multiplechoicecell,
    cell_utils
) {

	"use strict";

	var Notebook = requirejs("notebook/js/notebook").Notebook;

	var to_multiplicechoice = function (index) {
		var i = this.index_or_selected(index);
        if (this.is_valid_cell_index(i)) {
            var source_cell = this.get_cell(i);

            if (source_cell.is_editable()) {
                var target_cell = this.insert_cell_below('multiplechoice', i);
                var text = source_cell.get_text();

                if (text === source_cell.placeholder) {
                    text = '';
                }
                // metadata
                target_cell.metadata = source_cell.metadata;
                //target_cell.metadata.extended_type = 'multiplechoice';
                cell_utils.set_extended_type(target_cell, 'multiplechoice');

                target_cell.attachments = source_cell.attachments;

                // We must show the editor before setting its contents
                target_cell.unrender();
                target_cell.set_text(text);
                // make this value the starting point, so that we can only undo
                // to this state, instead of a blank cell
                target_cell.code_mirror.clearHistory();
                source_cell.element.remove();
                this.select(i);
                if ((source_cell instanceof textcell.TextCell) && source_cell.rendered) {
                    target_cell.render();
                }
                var cursor = source_cell.code_mirror.getCursor();
                target_cell.code_mirror.setCursor(cursor);
                this.set_dirty(true);
            }
        }
	};

	var cells_to_multiplechoice = function (indices) {
		if (indices === undefined) {
            indices = this.get_selected_cells_indices();
        }

        for (var i=0; i < indices.length; i++) {
            this.to_multiplicechoice(indices[i]);
        }
	}

    var to_markdown = function (index) {
        var i = this.index_or_selected(index);
        if (this.is_valid_cell_index(i)) {
            var source_cell = this.get_cell(i);

            if (source_cell.is_editable()) {
                var target_cell = this.insert_cell_below('markdown',i);
                var text = source_cell.get_text();

                if (text === source_cell.placeholder) {
                    text = '';
                }
                // metadata
                target_cell.metadata = source_cell.metadata;
                target_cell.attachments = source_cell.attachments;

                // We must show the editor before setting its contents
                target_cell.unrender();
                target_cell.set_text(text);
                // make this value the starting point, so that we can only undo
                // to this state, instead of a blank cell
                target_cell.code_mirror.clearHistory();
                source_cell.element.remove();
                this.select(i);
                if ((source_cell instanceof textcell.TextCell) && source_cell.rendered) {
                    target_cell.render();
                }
                var cursor = source_cell.code_mirror.getCursor();
                target_cell.code_mirror.setCursor(cursor);
                this.set_dirty(true);
            }
        }
    };

	var insert_cell_at_index = function (type, index) {

        var ncells = this.ncells();
        index = Math.min(index, ncells);
        index = Math.max(index, 0);
        var cell = null;
        type = type || this.class_config.get_sync('default_cell_type');
        if (type === 'above') {
            if (index > 0) {
                type = this.get_cell(index-1).cell_type;
            } else {
                type = 'code';
            }
        } else if (type === 'below') {
            if (index < ncells) {
                type = this.get_cell(index).cell_type;
            } else {
                type = 'code';
            }
        } else if (type === 'selected') {
            type = this.get_selected_cell().cell_type;
        }

        if (ncells === 0 || this.is_valid_cell_index(index) || index === ncells) {
            var cell_options = {
                events: this.events, 
                config: this.config, 
                keyboard_manager: this.keyboard_manager, 
                notebook: this,
                tooltip: this.tooltip
            };
            switch(type) {
            case 'code':
            	console.log(cell);

                cell = new codecell.CodeCell(this.kernel, cell_options);
                
                console.log(cell.metadata);
                cell.set_input_prompt();

                console.log(cell);
                break;
            case 'markdown':
                cell = new textcell.MarkdownCell(cell_options);
                break;
            case 'raw':
                cell = new textcell.RawCell(cell_options);
                break;
            case 'multiplechoice':
                cell = new multiplechoicecell.MultipleChoiceCell(cell_options);
                break;
            default:
                console.log("Unrecognized cell type: ", type, cellmod);
                cell = new cellmod.UnrecognizedCell(cell_options);
            }

            if(this._insert_element_at_index(cell.element,index)) {
                cell.render();
                this.events.trigger('create.Cell', {'cell': cell, 'index': index});
                cell.refresh();
                // We used to select the cell after we refresh it, but there
                // are now cases were this method is called where select is
                // not appropriate. The selection logic should be handled by the
                // caller of the the top level insert_cell methods.
                this.set_dirty(true);
            }
        }


        return cell;

    };

    var select = function (index, moveanchor) {
        moveanchor = (moveanchor===undefined)? true : moveanchor;

        if (this.is_valid_cell_index(index)) {
            var sindex = this.get_selected_index();
            if (sindex !== null && index !== sindex) {
                // If we are about to select a different cell, make sure we are
                // first in command mode.
                if (this.mode !== 'command') {
                    this.command_mode();
                }
                this.get_cell(sindex).unselect(moveanchor);
            }
            if(moveanchor){
                this.get_cell(this.get_anchor_index()).unselect(moveanchor);
            }
            var cell = this.get_cell(index);
            cell.select(moveanchor);
            this.update_soft_selection();
            if (cell.cell_type === 'heading') {
                this.events.trigger('selected_cell_type_changed.Notebook',
                    {
                        'cell_type': cell.cell_type,
                        'level': cell.level,
                        'editable': cell.is_editable()
                    }
                );
            } else if (cell.metadata.extended_type !== undefined) {
            	this.events.trigger('selected_cell_type_changed.Notebook',
                    {
                        'cell_type': cell.cell_type,
                        'extended_type': cell_utils.get_extended_type(cell),
                        'editable': cell.is_editable()
                    }
                );
            } else {
                this.events.trigger('selected_cell_type_changed.Notebook',
                    {
                        'cell_type': cell.cell_type,
                        'editable': cell.is_editable()
                    }
                );
            }
        }
        return this;
	};

	var patch_prototypes = function () {

        Notebook.prototype.to_multiplicechoice = to_multiplicechoice;
        Notebook.prototype.cells_to_multiplechoice = cells_to_multiplechoice;
        Notebook.prototype.to_markdown = to_markdown;
        Notebook.prototype.insert_cell_at_index = insert_cell_at_index;
        Notebook.prototype.select = select;

    };

    return {
    	patch_prototypes: patch_prototypes
    }

});