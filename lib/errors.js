/**
Error types

@module errors
*/

var createError = require('create-error');

/**
Error type DataTransformError
*/
var DataTransformError = createError('DataTransformError', {message: "Data Transform Error"});

/**
Error type FilterWarning
*/
var FilterWarning = createError('FilterWarning', {message: "Filter Warning"});

module.exports = {
	DataTransformError: DataTransformError,
	FilterWarning: FilterWarning
};