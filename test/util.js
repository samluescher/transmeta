var util = require('../util'),
	assert = require('assert');

describe('Util', function() {

	var obj = {
		hello: {
			world: 'Hello World!'
		}
	};

	it ('should get object attributes via dot notation', function() {
		assert.equal(util.getAttr(obj, 'hello.world'), 'Hello World!');
	});

	it ('should set object attributes via dot notation', function() {
		assert.equal(util.setAttr(obj, 'some.deep.path', 'value'), obj);
		assert.equal(util.setAttr(obj, 'some.deep.deeper.path', 'value'), obj);
		assert.deepEqual(obj, {
			hello: {
				world: 'Hello World!'
			},
			some: {
				deep: {
					path: 'value',
					deeper: {
						path: 'value'
					}
				}
			}
		});
	});

	
	it ('should expand objects', function() {
		var obj = {
			'some.deep.path': 'value',
			'some.path': 'othervalue'
		};
		assert.deepEqual(util.expandObj(obj), {
			some: {
				deep: {
					path: 'value'
				}, 
				path: 'othervalue'
			}
		});
	});

});
