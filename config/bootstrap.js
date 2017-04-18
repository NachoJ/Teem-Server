/**
 * Bootstrap
 * (sails.config.bootstrap)
 *
 * An asynchronous bootstrap function that runs before your Sails app gets lifted.
 * This gives you an opportunity to set up your data model, run jobs, or perform some special logic.
 *
 * For more information on bootstrapping your app, check out:
 * http://sailsjs.org/#!/documentation/reference/sails.config/sails.config.bootstrap.html
 */
var async = require('async');
var Job = require('kue').Job;
module.exports.bootstrap = function (cb) {

  // It's very important to trigger this callback method when you are finished
  // with the bootstrap!  (otherwise your server will never lift, since it's waiting on the bootstrap)
  //cb();

  //////////////////////
  // Async bootstrapping
  //////////////////////
  //console.log("Inside bootstrap");
  // sails.models.match.native(function (err, collection) {
  //   collection.ensureIndex({ coordinates: '2dsphere' }, function () {

  //     // It's very important to trigger this callback method when you are finished
  //     // with the bootstrap!  (otherwise your server will never lift, since it's waiting on the bootstrap)
  //     cb();

  //   });
  // });
  async.series([
    /**
     * Setup the emailTemplate (Mailer.template) service
     */

    //        function (cb) {
    //            //console.log(require("email-templates"));
    //            require("email-templates")(sails.config.paths.views + '/email', function (err, template) {
    //
    //                //console.log(err);
    //                //console.log(template);
    //                if (err)
    //                    sails.log.warn(err);
    //
    //                Mailer.template = template;
    //                //console.log(Mailer);
    //                cb();
    //            });
    //        },
    /**
     * Setup Kue
     */
    //      function(cb) {

    // 	OnlineUsers.destroy({}).exec(function(err) {
    // 		if (err) {

    // 		}
    // 	});

    // 	Room.destroy({}).exec(function(err) {
    // 		if (err) {

    // 		}
    // 	});

    // 	cb();
    // },
    function (cb) {
      sails.models.match.native(function (err, collection) {
        collection.ensureIndex({ coordinates: '2dsphere' }, function () {

          // It's very important to trigger this callback method when you are finished
          // with the bootstrap!  (otherwise your server will never lift, since it's waiting on the bootstrap)
          cb();

        });
      });
    },
    function (cb) {
      var kue = require('kue');

      //var redis = require('../node_modules/kue/node_modules/redis');
      var redis = require('redis');

      // Override default createClient function to allow
      // config options for redis client
      kue.redis.createClient = function () {
        var options = sails.config.redis;

        // Extract options from Redis URL
        if (sails.config.redis.url) {
          var redisUri = url.parse(sails.config.redis.url);
          options = {
            host: redisUri.hostname,
            port: redisUri.port,
            pass: redisUri.auth.split(':')[1]
          };
        }

        var client = redis.createClient(options.port, options.host, options);

        // Log client errors
        client.on("error", function (err) {
          sails.log.error(err);
        });

        // Authenticate, if required
        if (options.pass) {
          client.auth(options.pass, function (err) {
            if (err)
              sails.log.error(err);
          });
        }

        return client;
      }

      // Create job queue on Jobs service
      var processors = Jobs._processors;
      Jobs = kue.createQueue();
      Jobs._processors = processors;

      cb();
    }

  ], function () {

    ////////////////////////////////
    // All bootstrapping is finished
    ////////////////////////////////

    // If this is a worker instance, execute startWorker
    // callback to skip starting the server
    if (sails.config.worker) {
      return startWorker();
    }
    //startWorker();
    // If this is a normal Sails instance,
    // execute the callback to start the server
    cb();
  });
};


var logJobs = function () {
  Jobs
    .on('job complete', function (id) {
      Job.get(id, function (err, job) {
        if (err)
          return;
        sails.log.info('Job \'' + job.type + '\' (ID: ' + id + ') completed successfully.');
      });
    })
    .on('job failed', function (id) {
      Job.get(id, function (err, job) {
        if (err)
          return;
        console.log(job._error);
        console.log("\n");
        sails.log.warn('Job \'' + job.type + '\' (ID: ' + id + ') failed. Error: ' + job._error);
      });
    });
}


/**
 * Start job processors by invoking
 * Jobs.process() on each one of them
 */

var startProcessors = function () {
  for (var identity in Jobs._processors) {
    Jobs.process(identity, Jobs._processors[identity]);
  }
}


/**
 * Global startWorker callback that will kick off the worker instance
 *
 * This must be executed from within bootstrap.js if
 * sails.config.worker is set to true
 */

global.startWorker = function () {

  logJobs();
  startProcessors();

  sails.log.ship();

  var log = sails.log;
  sails.log.info('Sails worker instance started');
  sails.log.info('To shut down Sails worker, press <CTRL> + C at any time.');
  console.log();
  log('--------------------------------------------------------');
  log(':: ' + new Date());
  log();
  log('Environment\t: ' + sails.config.environment);

}
