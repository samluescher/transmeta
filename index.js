var errors = require('./errors'),
	util = require('./util'),
	DataTransformError = errors.DataTransformError, FilterWarning = errors.FilterWarning, 
	Document = require('./document'),
	coordinates = require('../../../geogoose/').coordinates,
	ValidationError = errors.ValidationError,
	console = require('../../../ext-console.js'),
	_ = require('cloneextend'),
	inherits = require('util').inherits,
	EventEmitter = require('events').EventEmitter,
	moment = require('moment');

var ARRAY_SEPARATORS = /[,;]/,
	DATE_NON_PERMISSIVE_EXCLUDE = /^[0-9]+$/,
	NUMBER_DECIMAL = /^\s*(\+|-)?((\d+(\.\d+)?)|(\.\d+))\s*$/;

function isErr(val) {
	return val instanceof Error;
}

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
			warnings.push('Not zero: ' + val);
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
		if ((!permissive && permissive != undefined || Array.isArray(permissive))) {
			if ((d + '').match(DATE_NON_PERMISSIVE_EXCLUDE)) return false;
		}
		var ret = d && true; /*d.isValid();*/
		if (!ret && warnings) {
			warnings.push('Not a valid date: ' + val);
		}
		return ret;
	},

	isDecimal: function(d, warnings) {
		var ret = (d + '').search(NUMBER_DECIMAL) != -1; 
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


var filterValue = function(val, filters, warnings) {
	if (!warnings) {
		warnings = [];
	}
	var makeFilter = function(args) {
		if (typeof(args) == 'function') return args;
		var args = args.split(':'),
			f = Filter[args.shift()];
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


var Cast = {

	Number: function(value, options)
	{
		var options = options || {};
		var num = Number(value);
		if (isNaN(num)) {
			return new DataTransformError('Not a number');
		}
		return num;
	},

	String: function(value, options) 
	{
		var options = options || {};
		if (value != undefined) {
			var str = '' + value;
			return str;
		}
	},

	Array: function(value, options) 
	{
		var options = options || {};
	    if (value != undefined) {
		    if (!Array.isArray(value)) {
		        return [value];
		    } else {
		        return value;
		    }
	    }
	},

	Date: function(value, options) 
	{
		var options = options || {},
			isArray = Array.isArray(value);
		if ((isArray && value.length == 3) || typeof(value) == 'string') {
			if (isArray) {
				value = _.clone(value);
				value[1]--;
			}
			var d = moment.call(moment, value);
			if (d && d.isValid()) {
				return d._d;
			}
		}
	}
}

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
			singleElement = from != '*' ?
				(!Array.isArray(from) ? from : from.length == 1 ? from[0] : null) : null;
		return function() {
			var arr = [];
			iterFields(from, this, function(v) {
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
		var options = options || {};
		if (!options.format) {
			var arrayOptions = _.cloneextend(options, {
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
		var options = options || {},
			arrayOptions = _.cloneextend(options, {
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
				arr = coordinates.coordinates2d(arr[0], arr[1]);
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
					obj = _.cloneextend(obj, val);
				} else {
					obj[key] = val;
				}
			});
			return obj;
		}
	}
}

var SetValue = function(value) {
	return function() {
		return value;
	}
};

/**
* Iterates over fields in doc and calls a callback for each field.
* Breaks if the callback returns false.
*
* Fields can be either a string, an array of strings, or '*' denoting
* all fields in doc. 
*/
var	iterFields = function(fields, doc, callback) {
	var fields = fields == '*' ?
		(typeof doc.keys == 'function' ? doc.keys() : Object.keys(doc))
		: Array.isArray(fields) ? fields : [fields];
	fields.every(function(key) {
		var ret = callback(doc.get(key), key);
		if (ret === false) return false;
		return true;
	});
};

/**
Initializes a DataTransform object based on field descripts, which look like the
following:

	descript = [
		{
			'to': '<to-field-name>',
			'type': 'Number|String|Array|Date|Object',
			'from': '<from-field-name>'|['<field1>', '<field2>', '...'],
			'options': { // all are optional
				'min': <Number>, // for Number
				'max': <Number>, // for Number
				'skipEmpty': <Boolean>, // for Number
				'igoreZero': <Boolean>, // for String
				'skipFuture': <Boolean>, // for Date
				'cast': '<field-type>' // for Array and Object elements
		}
		
		// or
		
		{
			'to': '<to-field-name>',
			'set': <constant-value>
		}
	]
*/

var DataTransform = function(descripts, options) 
{
    EventEmitter.call(this);
	var fields = {}, setters = {},
		descripts = !Array.isArray(descripts) ? [] : descripts;
	this.fields = [];
	this.setters = {};
	this.filters = {};
	this.descripts = [];
	this.verbose = false;
	this.series = [];
	if (descripts) this.addFields(descripts);
	this.options = _.cloneextend({
		strict: true
	}, options || {});
};

inherits(DataTransform, EventEmitter);

DataTransform.prototype.addFields = function(descripts)
{
	for (var i = 0; i < descripts.length; i++) {
		this.addField(descripts[i]);
	}
};

DataTransform.prototype.addField = function(d)
{
	this.fields.push({
		name: d.to,
		label: d.label ? d.label : 
			/*(d.from && d.from != '*' ?
				(Array.isArray(d.from) ? d.from.join(', ') : d.from) : d.to)*/
			d.to.split('.').pop(),
		type: d.type
	});
	this.descripts.push(d);

	var opts = d.options || {};

	if (d.set) {
		this.setters[d.to] = SetValue(d.set);
	} else if (!d.type || !FieldType[d.type]) {
		throw new ValidationError('Invalid field type: ' + d.type);
	} else if (d.series) {
		var opts = _.cloneextend(d.options || {}, {
				cast: d.type
			}),
			transform = d.series.length ? new DataTransform(d.series) : null;
		this.setters[d.to] = FieldType.Array(d.from || d.to, opts);
		this.filters[d.to] = opts.filters || {};
		this.series.push({
			to: d.to,
			from: d.from,
			transform: transform
		});
		if (transform) {
			this.fields = this.fields.concat(transform.fields);
		}
	} else {
		this.setters[d.to] = FieldType[d.type](d.from || d.to, d.options);
	}
	this.filters[d.to] = opts.filters;
};

DataTransform.prototype.emitData = function(transformed, ToModel, numErrors)
{
	var m = null;
	if (ToModel && (!this.options.strict || !numErrors)) {
		m = new ToModel({}, false);
		for (var key in transformed) {
			m.set(key, transformed[key]);
		}
	}

	if (this.verbose) {
		//console.log('original:', fromDoc);
		console.log('transformed:', transformed);
		console.log('model:', m);
	}

	var emit = {
		model: (!this.options.strict || !numErrors ? m : null),
		transformed: transformed
	};

	this.emit('data', emit.model, emit.transformed);
};

DataTransform.prototype.__transformDocument = function(fromDoc)
{
	var transformed = {},
		numErrors = 0;

	for (var to in this.setters) {
		var f = this.setters[to],
			filters = this.filters[to],
			transformedValue = f.apply(fromDoc, [transformed]);

		if (filters) {
			var warnings = [],
				filteredValue = filterValue(transformedValue, filters, warnings);
			if (warnings.length && (!Array.isArray(filteredValue) || !filteredValue.length)) {
				transformed[to] = new FilterWarning(warnings.join(', '));
			} else {
				transformed[to] = filteredValue;
			}
		} else {
			transformed[to] = transformedValue;
		}
		
		if (isErr(transformed[to])) {
			var err = transformed[to],
				log = err instanceof FilterWarning ? 'warn' : 'error';
			console[log](err.name + ' on field ' + to + ':', err.message);
			numErrors++;
		}

	}

	return {
		transformed: transformed,
		numErrors: numErrors
	};
};

DataTransform.prototype.transform = function(fromDoc, ToModel) 
{
	var self = this,
		result = this.__transformDocument(fromDoc);

	if (!this.series.length) {
		this.emitData(result.transformed, ToModel, result.numErrors);
	} else {
		this.series.forEach(function(series) {
			result.transformed[series.to].forEach(function(value, index) {
				if (self.verbose) {
					console.log('emitting series: ' + series.to + '/' + index);
				}
				var data = _.clone(result.transformed);
				data[series.to] = value;
				if (series.transform) {
					var subResult = series.transform.__transformDocument(new Document(
						_.cloneextend(data, {
							'$series': {
								from: series.from[index],
								index: index
							} 
						}, data)));
					data = _.cloneextend(data, subResult.transformed);
				}
				self.emitData(data, ToModel, result.numErrors + subResult.numErrors);
			});
		})
	}
};

module.exports = {
	DataTransform: DataTransform,
	DataTransformError: DataTransformError,
	FilterWarning: FilterWarning,
	Cast: Cast,
	FieldType: FieldType,
	Document: Document,
	Filter: Filter,
	filterValue: filterValue,
	util: util
};
