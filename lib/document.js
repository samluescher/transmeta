var util = require('./util'),
	_ = require('underscore');

/**
A simple document class for nested data structures.

@constructor
@param {object} attributes - (optional) The documents initial attributes
*/
var Document = function(attributes) {
	this.attributes = attributes ? _.extend({}, attributes) : {};
};

/**
Returns the document's data as an object.
*/
Document.prototype.toObject = function() {
	return this.attributes; 
};

/**
Returns an attribute of the document using dot notation.

@param {string} attr - The name of the attribute
*/
Document.prototype.get = function(attr) {
	return util.getAttr(this.attributes, attr);
};

/**
Returns an attribute of the document using dot notation.

@param {string} attr - The name of the attribute
@param {mixed} value - The value to be set
*/
Document.prototype.set = function(attr, value) {
	util.setAttr(this.attributes, attr, value);
};

/**
Returns the document's attribute keys (top-level only).
*/
Document.prototype.keys = function() {
	return Object.keys(this.attributes);
};

module.exports = Document;