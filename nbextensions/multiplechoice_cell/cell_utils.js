define([
	'base/js/namespace'
], function (Jupyter) {

	"use strict";

	var set_extended_type = function (cell, type) {
		if (cell.metadata.extended_type === undefined) {
			cell.metadata.extended_type = {};
		}
		cell.metadata.extended_type.type = type;
	}

	var get_extended_type = function (cell) {
		if (cell.metadata.extended_type === undefined) {
			return undefined;
		}
		return cell.metadata.extended_type.type;
	}

	var remove_extended_type = function (cell) {
		delete cell.metadata.extended_type;
	}

	var get_extended_metadata = function (cell) {
		return cell.metadata.extended_type;
	}

	return {
		set_extended_type: set_extended_type,
		get_extended_type: get_extended_type,
		remove_extended_type: remove_extended_type,
		get_extended_metadata: get_extended_metadata
	};

});