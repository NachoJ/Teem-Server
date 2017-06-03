// var kue = require('kue');
// require('sails').load({
//     hooks: {
//         blueprints: false,
//         cors: false,
//         csrf: false,
//         grunt: false,
//         http: false,
//         i18n: false,
//         logger: false,
//         policies: false,
//         pubsub: false,
//         request: false,
//         responses: false,
//         session: false,
//         sockets: false,
//         views: false
//       }
//     }, function (err, app) {
//           sails.log.info('Starting kue');
//           var kue_engine = sails.config.kue;

//           //register kue.

//           kue_engine.on('job complete', function (id) {
//               sails.log.info('Removing completed job: ' + id);
//               kue.Job.get(id, function (err, job) {
//                   job.remove();
//               });
//           });
//           kue_engine.process('delete_verified_email', 20, function (job, done) {
//               // you can access the data passed while creating job at job.data
//               // all the sails models, services are available here
//               console.log("job");
//               console.log(job.data.admin_email);
//               done && done();
//           });
//       });


var sails = require('sails'),
	Job = require('kue').Job;

/**
 * Lift sails without starting the server
 * 
 * Setting worker to true will execute the global
 * startWorker callback instead of the default sails 
 * bootstrap callback function.
 *
 * This will prevent Sails from starting the server.
 * We are also setting a very long bootstrap timeout (1 year)
 * so that Sails won't warn us about an unusually long 
 * bootstrapping time.
 */
sails.lift({
	worker: true,
	bootstrapTimeout: 60 * 60 * 24 * 365
}, function(err) {
	if (err) {
		console.log('Error occurred lifting Sails app:', err);
		return;
	}

	// --•
	console.log('Sails app lifted successfully!');
	console.log("sails.config.models.connection: "+sails.config.models.connection);
	//console.log("\nsails.config.siteName: " + sails.config.siteName + "\n");

});


/**
 * Log job success and failures
 */

var logJobs = function() {
	Jobs
		.on('job complete', function(id) {
			Job.get(id, function(err, job) {
				if (err) return;
				sails.log.info('Job \'' + job.type + '\' (ID: ' + id + ') completed successfully.');
			});
		})
		.on('job failed', function(id) {
			Job.get(id, function(err, job) {
				if (err) return;
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

var startProcessors = function() {
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

//global.startWorker = function() {
//
//  logJobs();
//  startProcessors();
//
//  sails.log.ship();
//
//  var log = sails.log;
//  sails.log.info('Sails worker instance started');
//  sails.log.info('To shut down Sails worker, press <CTRL> + C at any time.');
//  console.log();
//  log('--------------------------------------------------------');
//  log(':: ' + new Date());
//  log();
//  log('Environment\t: ' + sails.config.environment);
//
//}