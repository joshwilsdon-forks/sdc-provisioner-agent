var assert = require('assert-plus');
var async = require('async');
var zfs = require('zfs').zfs;

var common = require('../common');
var imgadm = require('../imgadm');
var Task = require('task_agent/lib/task');


function ImageEnsurePresentTask(req) {
    Task.call(this);
    this.req = req;
    this.zpool = req.params.zfs_storage_pool_name || 'zones';
}

Task.createTask(ImageEnsurePresentTask);


function start() {
    var self = this;

    var fullDataset;
    var params = self.req.params;
    var toImport = null;

    assert.optionalString(params.image_uuid, 'params.image_uuid');

    toImport = params.image_uuid;

    fullDataset = self.zpool + '/' + toImport;

    self.log.info(
        'Checking whether zone template dataset '
        + fullDataset + ' exists on the system.');

    zfs.list(
        fullDataset,
        { type: 'all' },
        function (error, fields, list) {
            if (!error && list.length) {
                self.log.info('image already installed (' + fullDataset + ')');
                self.finish();
                return;
            } else if (error && error.toString().match(/does not exist/)) {
                self.log.info('image didn\'t appear to be installed');
                var options = {
                    uuid: toImport,
                    zpool: self.zpool,
                    log: self.log
                };
                imgadm.importImage(options, function (err) {
                    if (err) {
                        self.log.error(err);
                        self.fatal(err.message);
                        return;
                    }
                    self.finish();
                });
                return;
            }
        });
}


ImageEnsurePresentTask.setStart(start);

module.exports = ImageEnsurePresentTask;