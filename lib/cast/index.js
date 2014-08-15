var moment = require('moment'),
    DataTransformError = require('../errors').DataTransformError;

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
        var isArray = Array.isArray(value);
        if (isArray && value.length == 3) {
            if (isArray) {
                value = _.clone(value);
                value[1]--;
            }
        }
        var d = moment.call(moment, value);
        if (d && d.isValid()) {
            return d._d;
        }
    }
}

module.exports = Cast;