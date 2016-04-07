var transmeta = require('../lib/'),
    Cast = transmeta.Cast,
    assert = require('assert'),
    moment = require('moment');

describe('Date Casting', function() {

    var assertDateEqualUTC = function(d, str) {
        return assert.equal(moment(d).utc().format(), str);
    };

    it('should convert a full date with time', function() {
        assertDateEqualUTC(Cast.Date('2020-02-03 17:30:01,37.507551666667'), '2020-02-03T17:30:01+00:00');
    });

    it('should convert a full date with time and interpret timezone correctly', function() {
        assertDateEqualUTC(Cast.Date('2020-02-03T12:30:01-05:00'), '2020-02-03T17:30:01+00:00');
    });

    it('should interpret a UTC date when time was omitted', function() {
        assertDateEqualUTC(Cast.Date('2020-02-03'), '2020-02-03T00:00:00+00:00');
    });

    it('should convert a four-digit year to January 1st, midnight UTC', function() {
        assertDateEqualUTC(Cast.Date('1980'), '1980-01-01T00:00:00+00:00');
    });

});
