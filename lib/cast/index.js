var moment = require('moment'),
    DataTransformError = require('../errors').DataTransformError,
    _ = require('underscore');

var Cast = {

    Number: function(value)
    {
        var num = Number(value);
        if (isNaN(num)) {
            return new DataTransformError('Not a number');
        }
        return num;
    },

    String: function(value) 
    {
        if (value != undefined) {
            var str = '' + value;
            return str;
        }
    },

    Array: function(value) 
    {
        if (value != undefined) {
            if (!Array.isArray(value)) {
                return [value];
            } else {
                return value;
            }
        }
    },

    Date: function(value) 
    {
        var args = value,
            isArray = Array.isArray(args);
        if (typeof args == 'string' && args.match(/[0-9]{4}/)) {
            // If we can assume that string is just a year, 
            // prevent moment's deprecation warning by converting it to Array
            // https://github.com/moment/moment/issues/1407 
            args = [args];
        }
        if (isArray && args.length == 3) {
            args = _.clone(args);
            // Note that month is 0-based
            args[1]--;
        }
        // Assume UTC for time strings passed without timezone
        var d = moment.utc.call(moment, args);
        if (d && d.isValid()) {
            return d._d;
        }
    }
}

module.exports = Cast;