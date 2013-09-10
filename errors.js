var util = require('util'),
	basicErrors = require('../../../errors');

var DataTransformError = function(msg, errors) {
	DataTransformError.super_.call(this, msg, this.constructor);
    this.errors = errors;
}
util.inherits(DataTransformError, basicErrors.BasicError);
DataTransformError.prototype.name = 'DataTransformError';
DataTransformError.prototype.message = 'Transform Error';

var FilterWarning = function(msg, errors) {
	FilterWarning.super_.call(this, msg, this.constructor);
}
util.inherits(FilterWarning, basicErrors.BasicError);
FilterWarning.prototype.name = 'FilterWarning';
FilterWarning.prototype.message = 'Value Skipped';

module.exports = {
	DataTransformError: DataTransformError,
	FilterWarning: FilterWarning
};