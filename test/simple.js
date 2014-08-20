var transmeta = require('../lib/'),
    assert = require('assert');

describe('Simple Transformation', function() {

    it('should dissect an array of numbers into an array of odd and an array of even numbers', function(done) {
        new transmeta.DataTransform()
            .field({
                'to': 'odd',
                'from': 'numbers',
                'type': 'Array',
                'options': {
                    'filters': ['isOdd']
                }
            }).field({
                'to': 'even',
                'from': 'numbers',
                'type': 'Array',
                'options': {
                    'filters': ['isEven']
                }
            }).transform({
                numbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
            }).on('data', function(transformed) {
                console.log(transformed);
                done();
            });
    });

});
