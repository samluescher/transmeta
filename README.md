Transmeta
=========

A data transformation library to filter and convert JSON documents into other structured data, using simple meta descriptions instead of code.

Copyright (c) 2013-2014, Samuel Luescher
Free and Open Source Software, released under an MIT license. 

Overview
--------

This is the age of micro formats and messy CSV files containing valuable data. While similar tools usually focus on tabular data and programming instructions to transform it, this library can take any source structure—think JSON or nested XML document, but tables as well—and transform it into an arbitrary destination format. Instead of functions to transform the data, it is based on simple meta information that describes field conversion, type casting, filtering and nesting.

This meta information can easily be reused and, rather than programming code, a GUI may be built that allows novice user to create complex data transformations.

Examples: Convert an untyped, badly formatted CSV file into valid GeoJSON geometry. Take spreadsheet data where rows are cities and 50 columns list population numbers per year, and turn it into a data stream that emits a Mongoose model instance for each city, each year.

Examples
--------

### Simple number filtering

Consider the following object:

```javascript
	var obj = {
		numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
	};
```

Assuming we would like to traverse the numbers array, and construct a second object where the numbers are filtered into two separate arrays, one containing odd numbers only, and another one containing the even numbers.

We can describe this transformation with the following meta information:

```javascript
	// we instantiate a new DataTransform instance:
	var oddEven = new transmeta.DataTransform()
		// we add a meta description for odd numbers:
		.field({
			'from': 'numbers',         // the element the source data is from
			'to': 'odd',               // the destination element
			'type': 'Array',           // the type of the destination element
			'options': {
				'filters': ['isOdd']   // a built in number filter for odd numbers
			}
		})
		// and the same for even numbers:
		.field({
			'from': 'numbers',
			'to': 'even',
			'type': 'Array',
			'options': {
				'filters': ['isEven']
			}
		});
```

Finally, we run the transformation, and asyncronously receive the transformed result:

```javascript
	oddEven.transform(obj)
		.on('data', function(transformed) {
			console.log(transformed);
			// { odd: [ 1, 3, 5, 7, 9 ], even: [ 2, 4, 6, 8, 10 ] }
		});
```

