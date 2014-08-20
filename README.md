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
				'filters': ['isOdd']   // a built-in number filter for odd numbers
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


### Emitting a series of models

Consider the following CSV data, exported from a spreadsheet listing urban agglomerations per year:

```csv
	Country,Urban Agglomeration,Latitude,Longitude,1950,1955,1960,1965,1970,1975,1980,1985,1990,1995,2000,2005,2010,2015,2020,2025
	Japan,Tokyo,35.69,139.75,11274641,13712679,16678821,20284371,23297503,26614733,28548512,30303794,32530003,33586573,34449908,35621544,36932780,38196677,38707439,38661394
	India,Delhi,28.67,77.22,1369369,1781624,2282962,2845042,3530693,4425964,5558481,7325185,9725885,12407372,15732304,18670494,21935142,25628951,29273777,32935013
	China,Shanghai,31.23,121.47,4300942,5846383,6819634,6428131,6036492,5626640,5966171,6846765,7823028,10449535,13958981,16590006,19554059,22962830,26120519,28403898'
```

