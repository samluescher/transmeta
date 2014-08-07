var transmeta = require('../'),
	assert = require('assert');

describe('Simple transformation', function() {

	var source = {
		'lat': 10,
		'lng': ' 11.0',
		'coordinates': ' 180,  85 ',
		'isodate': '1980-01-'
	};

	var dataTransform = new transmeta.DataTransform([
		{
			'to': 'xy',
			'type': 'LatLng',
			'from':  ['lat', 'lng']
		},
		{
			'to': 'coordinates',
			'type': 'LngLat',
			'from': ['coordinates']
		},
		{
			'to': 'numbers',
			'from': ['lat', 'lng'],
			'type': 'Object',
			'options': {
				'cast': 'Number'
			}
		},
		{
			'to': 'array1',
			'from': 'coordinates',
			'type': 'Array',
			'options': {
				'cast': 'Number',
				'split': true
			}
		},
		{
			'to': 'array2',
			'from': 'coordinates',
			'type': 'Array',
		}
	]);

	var sourceToFilter = {
		'array1': [1, 2, 3, 0, 4, 5, 0, 6]
	};

	var filteredMeta = [
		{
			'to': 'array1',
			'from': 'array1',
			'type': 'Array',
			'options': {
				'filters': ['notZero', 'isEven', 'lte:4']
			}
		},
		{
			'to': 'number',
			'set': '1',
			'options': {
				'filters': ['isEven']
			}
		}
	];
	var dataTransformFiltered = new transmeta.DataTransform(filteredMeta),
		dataTransformFilteredNotStrict = new transmeta.DataTransform(filteredMeta, {strict: false});

	dataTransform.on('data', function(transformed) {
		it('should emit data passing a simple object when not passed a Document class', function() {
			assert(typeof transformed == 'object');
			assert(!(transformed instanceof transmeta.Document));
		});

		it('should convert [Lat,Lng] to [Lng,Lat]', function() {
			assert.deepEqual(transformed['xy'], [11, 10]);
		});

		it('should convert "Lng,Lat" to [Lng,Lat]', function() {
			assert.deepEqual(transformed['coordinates'], [180, 85]);
		});

		it('should cast numeric fields to numbers and return an object', function() {
			assert.deepEqual(transformed['numbers'], {lat: 10, lng: 11});
		});

		it('should return an array of numbers extracted from a comma-separated string', function() {
			assert.deepEqual(transformed['array1'], [180, 85]);
		});

		it('should return an array of all items', function() {
			assert.deepEqual(transformed['array2'], [source.coordinates]);
		});
	});

	it('should correctly apply filters', function() {
		assert.deepEqual(
			transmeta.filterValue(sourceToFilter.array1, dataTransformFiltered.descripts[0].options.filters),
			[2, 4]
		);
		assert.equal(
			transmeta.filterValue(1, dataTransformFiltered.descripts[1].options.filters),
			undefined
		);
	});

	dataTransformFiltered.on('data', function(model, transformed) {
		console.log('=====', model);
		it('should not emit an instance of passed Document class in strict mode when a transformation error happens, still emit the transformed object, but with error instances in the data', function() {
			assert.equal(model, null);
	
			assert.deepEqual(transformed.array1, [2, 4]);
			assert(transformed.number instanceof Error);
			assert.deepEqual(transformed.number, { message: 'Not even: 1' } );
		});
	});

	dataTransformFilteredNotStrict.on('data', function(model, transformed) {
		it('should emit an instance of passed Document class even if a transformation error happens, but with error instances in the data', function() {
			assert(model instanceof transmeta.Document);

			assert.deepEqual(model.attributes.array1, [2, 4]);
			assert(model.attributes.number instanceof Error);
			assert.deepEqual(model.attributes.number, { message: 'Not even: 1' } );
		});
	});

	dataTransform.transform(source);
	dataTransformFiltered.transform(sourceToFilter, transmeta.Document);
	dataTransformFilteredNotStrict.transform(sourceToFilter, transmeta.Document);

});
