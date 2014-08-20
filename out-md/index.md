Global
===





---

DataTransform
===
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

DataTransform.addField(meta) 
-----------------------------
Adds one field to the DataTransform instance.

**Parameters**

**meta**: array, the field meta information

DataTransform.addFields(meta) 
-----------------------------
Adds an array of fields to the DataTransform instance.

**Parameters**

**meta**: array, the field meta information

DataTransform.transform() 
-----------------------------
Transforms a source document and emits data in the target format.



---








