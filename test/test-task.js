var testCase = require('nodeunit').testCase;
var async = require('async');
var util = require('util');
var Client = require('task_agent/lib/client');
var common = require('./lib/common');
var fs = require('fs');
var path = require('path');
var Zone = require('tracker/lib/zone');

function setup(callback) {
    var self = this;

    common.createClient(function (handle) {
        self.handle = handle;
        callback();
    });
}

function teardown(callback) {
    var self = this;
    self.handle.connection.end();
    callback();
}

function testTask(test) {
    test.expect(9);

    var self = this;
    var task = 'nop';
    var events = [];

    self.handle.sendTask(task, {}, function (taskHandle) {
        console.log('Inside the sendTask callback');
        taskHandle.on('event', function (eventName, msg) {
            events.push([eventName, msg]);
            test.equal(
                msg.error, undefined,
                'No error received');
                test.notEqual(
                    eventName, 'error',
                    'Event type was not error');

                    if (eventName == 'finish') {
                        finish();
                    }
        });
    });

    function finish() {
        test.deepEqual(
            events,
            [
                ['progress', { value: 0}],
                ['start', {}],
                ['progress', { value: 100}],
                ['finish', {}]
            ]);
        test.done();
    }
}

module.exports = testCase({
    setUp: setup,
    tearDown: teardown,
    'test sending task': testTask
});
