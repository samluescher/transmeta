/**
Utility functions for working with objects.

@module util
*/

var _ = require('underscore');


/**
Returns an attribute of an object by path in dot notation.
Example:
    
    var obj = {
        hello: {
            world: 'Hello World!'
        }
    };
    getAttr(obj, 'hello.world') // ==> 'Hello World!'

*/
var getAttr = function(obj, path) {
    var _get = function(obj, pathSegments) {
        if (!obj) return undefined;
        var el = obj[pathSegments.shift()];
        if (!pathSegments.length) return el;
        return _get(el, pathSegments);
    };
    return _get(obj, path.split('.'));
};


/**
Sets an attribute of an object by path in dot notation.
Example:
    
    setAttr(obj, 'some.path', 'value') // ==> {some: {path: 'value'}}

*/
var setAttr = function(obj, path, value) {
    var _set = function(obj, pathSegments) {
        if (pathSegments.length == 1) {
            obj[pathSegments[0]] = value;
            return;
        }
        var seg = pathSegments.shift();
        if (obj[seg] == undefined) {
            obj[seg] = {};
        }
        _set(obj[seg], pathSegments);
    };
    _set(obj, path.split('.'));
    return obj;
};

/**
Expands an object that has attributes with dot notation into
a nested copy of the object. Example:

    var obj = {
        'some.deep.path': 'value',
        'some.path': 'value'
    };
    expandObj(obj) ==> {some: {deep: {path: value}, path: value}}
*/
var expandObj = function(obj) {
    var retObj = {};
    for (var k in _.clone(obj)) {
        setAttr(retObj, k, obj[k]);
    }
    return retObj;
};


/**
Iterates over fields in doc and calls a callback for each field.
Breaks if the callback returns false.

Fields can be either a string, an array of strings, or '*' denoting
all fields in doc. 
*/
var iterFields = function(fields, doc, callback) {
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
* Simple Python-style string formatting.
*
* Example:
*
*   "%(foo)s, %(bar)s!".format({foo: 'Hello', bar: 'world'})
*/
formatString = function(str, replacements) {
    return str.replace(/\%\((.+?)\)(s|i)/ig, function(match, name, type) { 
        return typeof replacements[name] != 'undefined'
            ? replacements[name]
            : match;
    });
};


function isErr(val) {
    return val instanceof Error;
}


module.exports = {
    getAttr: getAttr,
    setAttr: setAttr,
    expandObj: expandObj,
    iterFields: iterFields,
    isErr: isErr,
    formatString: formatString
};

