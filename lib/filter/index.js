var moment = require('moment'),
    Cast = require('../cast');

    // matches "Mon Jan 01 2001 00:00:00 GMT-0500 (EST)" or "2001-12-12T12:00:11.333Z", but not "District 9"
var DATE_NON_PERMISSIVE_INCLUDE = /^[\ a-zA-Z]*([0-9]+([\:\-\/\ \.T]+|$)){2,}[0-9]*(([A-Z+]{1,3})?([\+\-][0-9\:]+(\ \([A-Z]{1,3}\))?)?)?$/,
    NUMBER_DECIMAL = /^\s*(\+|-)?((\d+(\.\d+)?)|(\.\d+))\s*$/;


var Filter = {

    isEmpty: function(val, warnings) {
        var ret = val == '' || val == undefined || val == null || (Array.isArray(val) && !val.length);
        if (!ret && warnings) {
            warnings.push('Not empty: ' + val);
        }
        return ret;
    },

    isZero: function(val, warnings) {
        var ret = val === 0;
        if (!ret && warnings) {
            warnings.push('Not zero: ' + val);
        }
        return ret;
    },

    isFuture: function(val, warnings) {
        var ret = Filter.isValidDate(val) && val > new Date();
        if (!ret && warnings) {
            warnings.push('Not future: ' + val);
        }
        return ret;
    },

    isOdd: function(val, warnings) {
        var ret = val % 2 != 0;
        if (!ret && warnings) {
            warnings.push('Not odd: ' + val);
        }
        return ret;
    },

    isEven: function(val, warnings) {
        var ret = val % 2 == 0;
        if (!ret && warnings) {
            warnings.push('Not even: ' + val);
        }
        return ret;
    },

    isValidDate: function(d, permissive, warnings) {
        if ((typeof d == 'string' || typeof d == 'number')
            && (!permissive && permissive != undefined || Array.isArray(permissive))) {
                if (!(d + '').match(DATE_NON_PERMISSIVE_INCLUDE)) return false;
        }
        var date = moment.call(moment, d),
            ret = date && date.isValid();
        if (!ret && warnings) {
            warnings.push('Not a valid date: ' + val);
        }
        return ret;
    },

    isInteger: function(val, warnings) {
        var ret = val % 1 === 0;
        if (!ret && warnings) {
            warnings.push('Not integer: ' + val);
        }
        return ret;
    },

    isDecimal: function(val, warnings) {
        var ret = (val + '').search(NUMBER_DECIMAL) != -1;
        if (!ret && warnings) {
            warnings.push('Not decimal: ' + val);
        }
        return ret;
    },

    notEmpty: function(val, warnings) {
        var ret = !Filter.isEmpty(val);
        if (!ret && warnings) {
            warnings.push('Is empty: ' + val);
        }
        return ret;
    },

    notZero: function(val, warnings) {
        var ret = !Filter.isZero(val);
        if (!ret && warnings) {
            warnings.push('Is zero: ' + val);
        }
        return ret;
    },

    notFuture: function(val, warnings) {
        var ret = !Filter.isFuture(val);
        if (!ret && warnings) {
            warnings.push('Is future: ' + val);
        }
        return ret;
    },

    lt: function(val, l, warnings) {
        var ret = val < l;
        if (!ret && warnings) {
            warnings.push('Not lt:' + l + ': ' + val);
        }
        return ret;
    },

    lte: function(val, l, warnings) {
        var ret = val <= l;
        if (!ret && warnings) {
            warnings.push('Not lte:' + l + ': ' + val);
        }
        return ret;
    },

    gt: function(val, g, warnings) {
        var ret = val > g;
        if (!ret && warnings) {
            warnings.push('Not gt:' + g + ': ' + val);
        }
        return ret;
    },

    gte: function(val, g, warnings) {
        var ret = val >= g;
        if (!ret && warnings) {
            warnings.push('Not gte:' + g + ': ' + val);
        }
        return ret;
    }

};


var filterValue = function(val, filters, warnings, castType) {
    if (!warnings) {
        warnings = [];
    }
    var makeFilter = function(args) {
        if (typeof(args) == 'function') return args;
        var args = args.split(':'),
            f = Filter[args.shift()];
        if (castType && args.length) {
            args[0] = Cast[castType].call(null, args[0]);
        }
        return function(val) {
            return f.apply(null, [val].concat(args).concat([warnings]));
        };
    };
    if (Array.isArray(val)) {
        var filtered = val;
        filters.forEach(function(filter) {
            var f = makeFilter(filter);
            filtered = filtered.filter(f);
        });
        return filtered;
    }
    if (filters.every(function(filter) {
        var f = makeFilter(filter);
        return f(val);
    })) return val;
};

module.exports = {
    Filter: Filter,
    filterValue: filterValue
};
