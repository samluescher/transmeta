var data = [];

var csv = 'Country code,Country,City Code,Urban Agglomeration,Latitude,Longitude,1950,1955,1960,1965,1970,1975,1980,1985,1990,1995,2000,2005,2010,2015,2020,2025\n'
    + '392,Japan,21671,Tokyo,35.69,139.75,11274641,13712679,16678821,20284371,23297503,26614733,28548512,30303794,32530003,33586573,34449908,35621544,36932780,38196677,38707439,38661394\n'
    + '356,India,21228,Delhi,28.67,77.22,1369369,1781624,2282962,2845042,3530693,4425964,5558481,7325185,9725885,12407372,15732304,18670494,21935142,25628951,29273777,32935013\n'
    + '156,China,20656,Shanghai,31.23,121.47,4300942,5846383,6819634,6428131,6036492,5626640,5966171,6846765,7823028,10449535,13958981,16590006,19554059,22962830,26120519,28403898',
    csvLines = csv.split('\n'),
    header = csvLines[0].split(','),
    originalDocuments = [];

for (var i = 1; i < csvLines.length; i++) {
    var row = csvLines[i].split(','),
        obj = {};
    for (var j = 0; j < row.length; j++) {
        obj[header[j]] = row[j];
    }
    data.push(obj);
}

module.exports = data;
