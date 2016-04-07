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
        if (typeof args == 'string' && args.match(/^[0-9]{4}$/)) {
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

        var d;
        if (typeof args == 'string' && args.match(/(Z|[\+\-]([0-9]{4}|[0-9]{2}:[0-9]{2})+)$/)) {
            // Strings with timezone information will be parsed accordingly
            d = moment.parseZone.call(moment, args);
        } else {
            // Assume UTC for time strings passed without timezone and all other args
            d = moment.utc.call(moment, args);
        }
        if (d && d.isValid()) {
            // Either way, calling toDate() will convert to local time
            var date = d.toDate();
            // So we preserve the moment object for convenience in case
            // original timezone is needed
            date.moment = d;
            return date;
        }
    }
}

module.exports = Cast;
