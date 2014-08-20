var transmeta = require('../lib/'),
    citySet = require('./data/cities'),
    _ = require('underscore'),
    assert = require('assert');

describe('Series Transformation', function() {

    var cities = [];
    citySet.forEach(function(doc) {
        cities.push(doc.toObject());
    });

    var years = ['1950', '1955', '1960', '1965', '1970', '1975', '1980', '1985', '1990', '1995', '2000', '2005', '2010', '2015', '2020', '2025'],
        meta = [
            {
                'from': ['Latitude', 'Longitude'],
                'to': 'geometry.coordinates',
                'type': 'LatLng',
            },
            {
                'from': 'Urban Agglomeration',
                'to': 'properties.City.Name',
                'type': 'String',
            },
            {
                'from': 'Country',
                'to': 'properties.Country',
                'type': 'String',
            },
            {
                'from': 'City Code',
                'to': 'properties.City.Code',
                'type': 'String',
            },
            {
                'from': years,
                'to': 'properties.Population',
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
        dataTransform.on('data', function(doc, transformed) {
            assert(doc instanceof transmeta.Document);
            transformedDocs.push(doc);
        }).on('end', function() {
            var doc = transformedDocs[transformedDocs.length - 1];

            describe('Serials Detail Transformation', function(){
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
        }).transform(cities, transmeta.Document);

    });

});
