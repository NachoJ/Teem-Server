//var fs = require("fs");

if (sails.config.mode === 'development') {

	sails.log("development call");

	process.on('uncaughtException', function(er) {

		//sails.log("development error", er);
		//sails.log("name =", sails.config.mail.from.name);

		// fs.writeFile('error.txt', er.stack, function(err) {
		// 	sails.log('complete');
		// });

		var message = {
			to: sails.config.mail.from.email,
			subject: "Error List",
			html: '<pre style="color:#444">' + er.stack + '</pre>'
		};

		Mailer.sendMail(message, function(err, result) {
			//sails.log("err", err);
			//sails.log("result", result);
			//process.send();
		});

		//process.send();
		//process.kill(process.pid, 'uncaughtException');
		//func();
	});


} else if (sails.config.mode === 'production') {

	sails.log("production");

	process.on('uncaughtException', function(er) {

		sails.log("--------------- production error -----------------");
        sails.log(er.stack);
		var message = {
			to: "chintan.adatiya@gmail.com",//sails.config.mail.from.email,
			subject: "Error Production",
			html: '<p>' + er.stack + '</p>'
		};

		Mailer.sendMail(message, function(err, result) {
			//sails.log("err", err);
			//sails.log("result", result);
			//cb(null, result, message);
		});
	
		//throw new Error('whoops');

		// var email = new Email._model({
		// 	to: {
		// 		name: sails.config.from.name,
		// 		email: sails.config.from.email
		// 	},
		// 	subject: "Error List",
		// 	data: {
		// 		"error": er
		// 	},
		// 	tags: ['activation', 'transactional'],
		// 	template: 'error'
		// });

		// email.setDefaults();

		// email.send(function(err, res, msg) {
		// 	console.log(err, res, msg, "token");
		// });
		// global.sendMail({
		//     to: 'milan@logisticinfotech.com',
		//     subject: er.message,
		//     html: er.stack
		// }, function (er) {
		//     //process.exit(1)
		// });
	});
}

// fs.readFile('somefile.txt', function(err, data) {
// 	if (err) {
// 		sails.log(err);
// 		throw err;
// 	}
// 	sails.log("data", data);
// });
