var transmeta = require('../../lib/');

var routes = new transmeta.DocumentSet({delimiter: ','})
	.header('Airline,Airline ID,Source airport,Source airport ID,Destination airport,Destination airport ID,Codeshare,Stops,Equipment')
routes.add('AA,24,ZRH,1678,JFK,3797,,0,763');

module.exports = routes;
