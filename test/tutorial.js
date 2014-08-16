var transmeta = require('../lib/'),
	assert = require('assert');

describe('Tutorial', function() {

	var taxiRoutes = [
		{taxiId: '1', origin: '40.752998,-73.977056', destination: '40.748433,-73.985656'}
	];

	it('asd', function(done) {
		new transmeta.DataTransform(
			[
				/*{
					to: 'properties.taxiId',
					set: 'taxiId'
				},*/
				{
					'to': 'geometry.coordinates',
					'from': [['origin'], ['destination']],
					'type': 'Array',
					'options': {
						//'cast': 'Number'
					}
				}
			])
			.transform(taxiRoutes[0])
			.on('data', function(data) {
				console.log('OUTPUT', data);
			});
		done();
	});

});
