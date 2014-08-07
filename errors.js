var createError = require('create-error');

var DataTransformError = createError('DataTransformError', {message: "Data Transform Error"}),
    FilterWarning = createError('FilterWarning', {message: "Filter Warning"});

module.exports = {
    DataTransformError: DataTransformError,
    FilterWarning: FilterWarning
};