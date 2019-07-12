define([
	'base/js/namespace',
	'notebook/js/maintoolbar',
	'base/js/i18n'
], function (
	Jupyter,
	maintoolbar,
	i18n
) {

    "use strict";

	var MainToolBar = maintoolbar.MainToolBar;

	var add_extended_celltype_list = function () {

		var that = this;
        var multiselect = $('<option/>').attr('value','multiselect').attr('disabled','').text('-');
        var sel = $('<select/>')
            .attr('id','extended_cell_type')
            .addClass('form-control select-xs')
            .append($('<option/>').attr('value','code').text(i18n.msg._('Code')))
            .append($('<option/>').attr('value','multiplechoice').text(i18n.msg._('MultipleChoice')))
            .append($('<option/>').attr('value','markdown').text(i18n.msg._('Markdown')))
            .append($('<option/>').attr('value','raw').text(i18n.msg._('Raw NBConvert')))
            .append($('<option/>').attr('value','heading').text(i18n.msg._('Heading')))
            .append(multiselect);
        this.notebook.keyboard_manager.register_events(sel);
        this.events.on('selected_cell_type_changed.Notebook', function (event, data) {

            if (data.editable === false) {
                sel.attr('disabled', true);
            } else {
                sel.removeAttr('disabled');
            }

            if (that.notebook.get_selected_cells_indices().length > 1) {
                multiselect.show();
                sel.val('multiselect');
            } else {
                multiselect.hide();
                if (data.cell_type === 'heading') {
                    sel.val('Markdown');
                } else if (data.extended_type !== undefined) {
                	sel.val(data.extended_type);
                
                } else {
                    sel.val(data.cell_type);
                }
            }
        });



        sel.change(function () {

	        ////

	        var selected_indices = Jupyter.notebook.get_selected_cells_indices();

	        for (var i = 0; i < selected_indices.length; i++) {
	        	delete Jupyter.notebook.get_cell(selected_indices[i]).metadata.extended_type;
                delete Jupyter.notebook.get_cell(selected_indices[i]).metadata.extended_type_options;
	        }

	        ////

            var cell_type = $(this).val();
            switch (cell_type) {
            case 'multiplechoice':
            	that.notebook.cells_to_multiplechoice();
            	break;
            case 'code':
                that.notebook.cells_to_code();
                break;
            case 'markdown':
                that.notebook.cells_to_markdown();
                break;
            case 'raw':
                that.notebook.cells_to_raw();
                break;
            case 'heading':
                that.notebook._warn_heading();
                that.notebook.to_heading();
                sel.val('markdown');
                break;
            case 'multiselect':
                break;
            default:
                console.log(i18n.msg._("unrecognized cell type:"), cell_type);
            }
            that.notebook.focus_cell();
        });
		return sel;

	};

	var register_menu = function () {
		MainToolBar.prototype._pseudo_actions.add_extended_celltype_list = add_extended_celltype_list;
		Jupyter.toolbar.add_buttons_group('<add_extended_celltype_list>');
	}

	return {
		register_menu: register_menu
	}

});