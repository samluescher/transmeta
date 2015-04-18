var transmeta = require('../lib/'),
	assert = require('assert'),
	_ = require('underscore'),
	airports = require('./data/airports');

describe('Joining Flight Data', function() {

	var airportsToGeoJSON = new transmeta.DataTransform()
		.field({
			'to': 'geometry.type',
			'set': 'Point'
		})
		.field({
			'to': 'geometry.coordinates',
			'from': ['Longitude', 'Latitude'],
			'type': 'Array',
			'options': {
				'cast': 'Number'
			}
		})
		.field({
			to: 'properties.location',
			from: ['Name', 'City', 'Country'],
			type: 'Object'
		})
		.field({
			to: 'properties.Code',
			from: 'IATA/FAA',
			type: 'String'
		});
	
	var airportsGeoJSON = [
		'{"geometry":{"type":"Point","coordinates":[-73.778925,40.639751]},"properties":{"location":{"Name":"John F Kennedy Intl","City":"New York","Country":"United States"},"Code":"JFK"}}',
		'{"geometry":{"type":"Point","coordinates":[8.549167,47.464722]},"properties":{"location":{"Name":"Zurich","City":"Zurich","Country":"Switzerland"},"Code":"ZRH"}}'
	];

	it('must convert CSV airport data to GeoJSON points including selective properties', function(done) {
		var counter = 0;
		airportsToGeoJSON
			.transform(airports, transmeta.Document)
			.on('data', function(data) {
				assert.deepEqual(JSON.parse(airportsGeoJSON[counter]), data.toObject());
				counter++;
			})
			.on('end', function() {
				done();
			});
	});


	// TODO: join routes with airport coordinates, and produce a LineString

	var routesToGeoJSON = new transmeta.DataTransform([
		{
			'to': 'geometry.type',
			'set': 'LineString'
		},
		{
			'to': 'geometry.coordinates',
			'from': ['$origin.geometry.coordinates', '$destination.geometry.coordinates'],
			'type': 'Array'
		}
	]);


	/*it('asd', function(done) {
		routesToGeoJSON
			.transform(routes)
			.join(
				airportsToGeoJSON
					.transform(airports)
			)
	});*/

});

