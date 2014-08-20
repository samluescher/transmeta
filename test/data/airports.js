var transmeta = require('../../lib/');

var airports = new transmeta.DocumentSet({delimiter: ','})
	.header('Airport ID,Name,City,Country,IATA/FAA,ICAO,Latitude,Longitude,Altitude,Timezone,DST');
airports.add('3797,John F Kennedy Intl,New York,United States,JFK,KJFK,40.639751,-73.778925,13,-5,A')
airports.add('1678,Zurich,Zurich,Switzerland,ZRH,LSZH,47.464722,8.549167,1416,1,E');

module.exports = airports;