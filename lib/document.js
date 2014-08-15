var util = require('./util');

var Document = function(attributes) {
    this.attributes = attributes;
};

Document.prototype.toObject = function() {
    return this.attributes; 
};

Document.prototype.get = function(attr) {
    return util.getAttr(this.attributes, attr);
};

Document.prototype.set = function(attr, value) {
    console.log('setAttr', attr);
    util.setAttr(this.attributes, attr, value);
};

Document.prototype.keys = function() {
    return Object.keys(this.attributes);
};

module.exports = Document;