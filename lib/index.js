var errors = require('./errors'),
    DataTransformError = errors.DataTransformError, FilterWarning = errors.FilterWarning, 
    util = require('./util'),
    filter = require('./filter'),
    Filter = filter.Filter,
    Cast = require('./cast'),
    FieldType = require('./field_type'),
    filterValue = filter.filterValue,
    Document = require('./document'),
    ValidationError = errors.ValidationError,
    _ = require('underscore'),
    inherits = require('util').inherits,
    EventEmitter = require('events').EventEmitter,
    isErr = require('./util').isErr;

var SetValue = function(value) {
    return function() {
        return value;
    }
};

/**
Initializes a DataTransform object based on field meta information. 
The `meta` parameter is an array containing elements that look as follows:

    {
        from: '<from-field-name>'|['<field1>', '<field2>', '...'],
        to: '<to-field-name>',
        type: 'Number|String|Array|Date|Object',

        // or:

        to: '<to-field-name>',
        set: <constant-value>

        // optional:

        options: { 
            filters
            cast
            split
            format
            join
            expand
        } 

    }
        
@constructor
@param {array} meta - An array containing field meta information
@param {object} options - Transformation options
*/

var DataTransform = function(meta, options) 
{
    EventEmitter.call(this);
    var fields = {}, 
        setters = {},
        meta = !Array.isArray(meta) ? [] : meta;
    this.fields = [];
    this.setters = {};
    this.filters = {};
    this.meta = [];
    this.verbose = false;
    this.series = [];
    if (meta) this.addFields(meta);
    this.options = _.extend({
        strict: true
    }, options || {});
};

inherits(DataTransform, EventEmitter);

/**
Adds one field to the DataTransform instance.

@param {array} meta - the field meta information
*/
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
    this.meta.push(d);

    var opts = d.options || {};

    if (d.set) {
        this.setters[d.to] = SetValue(d.set);
    } else if (!d.type || !FieldType[d.type]) {
        throw new ValidationError('Invalid field type: ' + d.type);
    } else if (d.series) {
        var opts = _.extend(d.options ? _.clone(d.options) : {}, {
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

/**
Adds an array of fields to the DataTransform instance.

@param {array} meta - the field meta information
*/
DataTransform.prototype.addFields = function(meta)
{
    for (var i = 0; i < meta.length; i++) {
        this.addField(meta[i]);
    }
};

DataTransform.prototype.emitData = function(transformed, ToModel, numErrors)
{
    var m = null;
    if (ToModel && (!this.options.strict || !numErrors)) {
        m = new ToModel(util.expandObj(transformed), false);
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

    if (ToModel) {
        this.emit('data', emit.model, emit.transformed);
    } else {
        this.emit('data', emit.transformed);
    }
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

/**
Transforms a source document and emits data in the target format.
*/
DataTransform.prototype.transform = function(fromObj, ToModel) 
{
    var self = this,
        fromDoc = typeof fromObj.get == 'function' ? fromObj : new Document(fromObj),
        result = this.__transformDocument(fromDoc);

    if (!this.series.length) {
        this.emitData(result.transformed, ToModel, result.numErrors);
    } else {
        this.series.forEach(function(series) {
            if (Array.isArray(result.transformed[series.to])) {
                result.transformed[series.to].forEach(function(value, index) {
                    if (self.verbose) {
                        console.log('emitting series: ' + series.to + '/' + index);
                    }
                    var data = _.clone(result.transformed);
                    data[series.to] = value;
                    if (series.transform) {
                        var subResult = series.transform.__transformDocument(new Document(
                            _.extend(_.clone(data), {
                                '$series': {
                                    from: series.from[index],
                                    index: index
                                } 
                            })));
                        data = _.extend(data, subResult.transformed);
                    }
                    self.emitData(data, ToModel, result.numErrors + subResult.numErrors);
                });
            }
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
