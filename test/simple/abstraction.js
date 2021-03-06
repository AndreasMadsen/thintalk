/**
 * Copyright (c) 2012 Andreas Madsen
 * MIT License
 */

var common = require('../common'),
	thintalk = require(common.modulePath),
    assert = require('assert'),
    EventEmitter = require('events').EventEmitter,
	vows = require('vows');

vows.describe('Testing abstraction interface').addBatch({

	'abstraction object': {
		'Listener' : {
			topic: function () {
				return thintalk.ListenerAbstract;
			},

			'do exist': function (result) {
				assert.isDefined(result);
				assert.isFunction(result);
				assert.equal(result.name, 'ListenerAbstract');
				assert.instanceOf(result.prototype, EventEmitter);
			}
		},

		'Communication': {
			topic: function () {
				return thintalk.CommunicationAbstract;
			},

			'do exist': function (result) {
				assert.isDefined(result);
				assert.isFunction(result);
				assert.equal(result.name, 'CommunicationAbstract');
				assert.instanceOf(result.prototype, EventEmitter);
			}
		},

		'Requester': {
			topic: function () {
				return thintalk.RequesterAbstract;
			},

			'do exist': function (result) {
				assert.isDefined(result);
				assert.isFunction(result);
				assert.equal(result.name, 'RequesterAbstract');
				assert.instanceOf(result.prototype, EventEmitter);
			}
		}
	},

	'when calling setLayer': {
		topic: function () {
			thintalk.setLayer('USER', {});
			return thintalk.layer.USER;
		},

		'the .layers has been filled': function (result) {
			assert.isDefined(result);
		}
	},

  'when requesting an unknown layer' : {
    'using requester': {
      topic: function () {
        var requester = thintalk();
        requester.once('error', this.callback.bind(this, null));
        requester.connect('unknown');
      },

      'an error will be emitted': function (error) {
        assert.equal(error.message, 'The layer unknown do not exist.');
      }
    },

    'using listener': {
      topic: function () {
        var listener = thintalk({
          add: function (a, b) {
            return a + b;
          }
        });
        listener.once('error', this.callback.bind(this, null));
        listener.listen('unknown');
      },

      'an error will be emitted': function (error) {
        assert.equal(error.message, 'The layer unknown do not exist.');
      }
    }
  }

}).exportTo(module);
