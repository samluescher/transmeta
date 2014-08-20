var util = require('./util'),
	Document = require('./document'),
	_ = require('underscore');

// Needs to return a copy of data
var Parser = {
	split: function(options) {
		return function(data) {
			return data.split(options.delimiter);
		}
	}
};

/**
@constructor
@param {object} attributes - (optional) The documents initial documents
*/
var DocumentSet = function(options) {
	this.options = _.extend({}, options);
	this.reset();
	this.keyNames = [];
	this.__parse = null;

	if (this.options.delimiter) {
		this.parser(Parser.split({delimiter: options.delimiter}));
	}
};

/**
Resets the DocumentSet to empty.
*/
DocumentSet.prototype.reset = function() {
	this.documents = [];
};

/**
The forEach() method executes a provided function once per Document in the set.
*/
DocumentSet.prototype.forEach = function(callback) {
	this.documents.forEach(callback);
};

/**
Adds a Document to the set.

@param {mixed} data - (optional) The data used to construct a Document instance,
	or a document instance.

If data is an array, the DocumentSet must have a defined header.
*/
DocumentSet.prototype.add = function(data) {
	if (this.__parse) {
		data = this.__parse(data);
	}

	var doc;
	if (!Array.isArray(data)) {
		doc = data;
	} else {
		doc = {};
		for (var i = 0; i < this.keyNames.length; i++) {
			doc[this.keyNames[i]] = data[i];
		}
	}

	if (doc instanceof Document == false) {
		doc = new Document(doc);
	};
	this.documents.push(doc);
	return doc;
};

/**
Sets the document's key names for loading an array.
*/
DocumentSet.prototype.header = function(data) {
	if (this.__parse) {
		data = this.__parse(data);
	}
	this.keyNames = data;
	return this;
};

/**
Sets a parser function for the add() and header() methods. 

The parser function takes one argument as data and must return 
a copy as an object or array used to construct a Document instance.
*/
DocumentSet.prototype.parser = function(func) {
	this.__parse = func;
	return this;
}

module.exports = DocumentSet;
