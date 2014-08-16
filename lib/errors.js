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
Error type ValidationError
*/
var ValidationError = createError('ValidationError', {message: "Data Validation Error"});

/**
Error type FilterWarning
*/
var FilterWarning = createError('FilterWarning', {message: "Filter Warning"});

module.exports = {
	DataTransformError: DataTransformError,
	ValidationError: ValidationError,
	FilterWarning: FilterWarning
};