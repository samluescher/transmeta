var errors = require('../errors'),
	iterFields = require('../util').iterFields,
	Cast = require('../cast'),
	isErr = require('../util').isErr,
	DataTransformError = errors.DataTransformError,
	_ = require('underscore');

var ARRAY_SEPARATORS = /[,;]/;

var FieldType = {

	Number: function(from, options) 
	{
		var options = options || {};
		return function() {
			var ret;
			iterFields(from, this, function(num) {
				var num = Cast.Number(num, options);
				if (num != undefined) {
					ret = num;
					return false;
				}
			});
			return ret;
		};
	},

	Array: function(from, options) 
	{
		var options = options || {},
			cast = options.cast ? Cast[options.cast] : null,
			toArr,
			singleElement = from != '*' ?
				(!Array.isArray(from) ? from : (from.length == 1 && !Array.isArray(from[0])) ? from[0] : null) : null;
		
		toArr = function(_from) {
			if (!_from) {
				_from = from;
			}
			if (!singleElement && Array.isArray(_from[0])) {
				return [toArr.call(this, _from[0])];
			}
				
			var arr = [];
			iterFields(_from, this, function(v) {
				if (Array.isArray(v) && singleElement) {
					arr = v;
					return false;
				}
				if (typeof v == 'string' && options.split) {
					if (v != undefined) {
						var splitArr = Cast.Array(v.split(
							options.split === true ? ARRAY_SEPARATORS : options.split));
						if (splitArr) {
							var al = splitArr.length;
							for (var j = 0; j < al; j++) {
								var casted = !cast ? splitArr[j] : cast(splitArr[j], options);
								if (isErr(casted)) {
									arr = casted;
									return false;
								}
								arr.push(casted);
							}
						}
					}
				} else {
					var casted = !cast ? v : cast(v, options);
					if (isErr(casted)) {
						arr = casted;
						return false;
					}
					arr.push(casted);
				}
			});
			return arr;
		};
		return toArr;
	},

	Date: function(from, options) 
	{
		var options = options || {},
			filters = options.filters || {},
			singleElement = from != '*' ?
				(!Array.isArray(from) ? from : from.length == 1 ? from[0] : null) : null;
		return function() {
			var date;
			if (singleElement) {
				date = Cast.Date(this.get(singleElement), options);
				if (!date) {
					return new DataTransformError('No date recognized');
				}
			} else {
				var numbers = [];
				iterFields(from, this, function(val) {
					numbers.push(Cast.Number(val, options));
				});
				date = Cast.Date(numbers);
				if (!date) {
					return new DataTransformError('No date recognized');
				}
			}
			if (date) {
				return date;            
			}
		};
	},

	String: function(from, options) 
	{
		var options = options ? _.clone(options) : {};
		if (!options.format) {
			var arrayOptions = _.extend(options, {
					'cast': 'String'
				}),
				toArray = FieldType.Array(from, arrayOptions);
			return function() {
				var arr = toArray.call(this);
				if (arr) {
					var joined = arr.join(options.join || ', ');
					return joined;
				}
			}
		} else {
			return function() {
				var strings = {};
				iterFields(from, this, function(str, key) {
					var str = Cast.String(str, options);
					if (str != undefined) {
						strings[key] = str;
					}
				});
				var formatted = options.format.format(strings); 
				return formatted;
			};
		}
	},

	LngLat: function(from, options) 
	{
		var options = options ? _.clone(options) : {},
			arrayOptions = _.extend(options, {
				cast: 'Number',
				split: true,
			}),
			toArray = FieldType.Array(from, arrayOptions);
		return function() {
			var arr = toArray.call(this);
			if (isErr(arr)) return arr;
			if (arr) {
				if (arr.length != 2) {
					return new DataTransformError('Needs 2D');
				}
				return arr;
			}
		}
	},
	
	LatLng: function(from, options) 
	{
		var toLngLat = FieldType.LngLat(from, options);
		return function() {
			var arr = toLngLat.call(this);
			if (arr) {
				if (isErr(arr)) return arr;
				return [arr[1], arr[0]];
			}
		}
	}, 

	Object: function(from, options) 
	{
		var options = options || {},
			singleElement = from != '*' ?
				(!Array.isArray(from) ? from : from.length == 1 ? from[0] : null) : null;
		return function() {
			var obj = {};
			iterFields(from, this, function(val, key) {
				if ((singleElement || options.expand) && typeof val == 'object') {
					obj = _.extend(obj, val);
				} else {
					obj[key] = val;
				}
			});
			return obj;
		}
	}
}

module.exports = FieldType;