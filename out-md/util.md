util
===

Utility functions for working with objects.



---

util.getAttr() 
-----------------------------
Returns an attribute of an object by path in dot notation.
Example:
    
    var obj = {
        hello: {
            world: 'Hello World!'
        }
    };
    getAttr(obj, 'hello.world') // ==> 'Hello World!'


util.setAttr() 
-----------------------------
Sets an attribute of an object by path in dot notation.
Example:
    
    setAttr(obj, 'some.path', 'value') // ==> {some: {path: 'value'}}


util.expandObj() 
-----------------------------
Expands an object that has attributes with dot notation into
a nested copy of the object. Example:

    var obj = {
        'some.deep.path': 'value',
        'some.path': 'value'
    };
    expandObj(obj) ==> {some: {deep: {path: value}, path: value}}


util.iterFields() 
-----------------------------
Iterates over fields in doc and calls a callback for each field.
Breaks if the callback returns false.

Fields can be either a string, an array of strings, or '*' denoting
all fields in doc.


util.formatString() 
-----------------------------
Simple Python-style string formatting.

Example:

  "%(foo)s, %(bar)s!".format({foo: 'Hello', bar: 'world'})



---








