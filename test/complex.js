var	transmeta = require('../'),
	cities = require('./data/cities'),
	_ = require('underscore'),
	assert = require('assert');

describe('Series Import', function() {

	var years = ['1950', '1955', '1960', '1965', '1970', '1975', '1980', '1985', '1990', '1995', '2000', '2005', '2010', '2015', '2020', '2025'],
		meta = [
			{
				'to': 'geometry.coordinates',
				'from': ['Latitude', 'Longitude'],
				'type': 'LatLng',
			},
			{
				'to': 'properties.City.Name',
				'from': 'Urban Agglomeration',
				'type': 'String',
			},
			{
				'to': 'properties.Country',
				'from': 'Country',
				'type': 'String',
			},
			{
				'to': 'properties.City.Code',
				'from': 'City Code',
				'type': 'String',
			},
			{
				'to': 'properties.Population',
				'from': years,
				'type': 'Number',
				'series': [
					{
						'to': 'properties.Year',
						'from': '$series.from',
						'type': 'Date',
					},
				]
			},
		],
		dataTransform = new transmeta.DataTransform(meta);

	var transformedDocs = [], isDone = false;

	it('should emit data asyncronously', function(done) {
		for (var i = 0; i < cities.length; i++) {
			var doc = new transmeta.Document(cities[i]),
				emitCount = 0;

			dataTransform.on('data', function(doc, transformed) {
				assert(doc instanceof transmeta.Document);
				transformedDocs.push(doc);			
				emitCount++;
				if (emitCount == cities.length * years.length) {
					isDone = true;

					describe('Complex transformation', function(){
						var cityCode, fullYear;
					
						it('should expand the flat data into a nested document', function() {
							cityCode = doc.get('properties.City.Code');
							assert(cityCode);
							assert.equal(cityCode, doc.attributes.properties.City.Code);
						});

						it('should convert the year into a Date object', function() {
							var year = doc.get('properties.Year');
							assert(year instanceof Date);
							fullYear = year.getFullYear() + 1;
						});

						it('should emit series of documents for each year column, and assign the columns name to a field', function() {
							var original = _.where(cities, {'City Code': cityCode});
							assert.equal(original.length, 1);
							assert.equal(original[0][fullYear+''], doc.get('properties.Population'));
						});
					});

					done();
				}
			});

			dataTransform.transform(doc, transmeta.Document);
		}
	});

});
