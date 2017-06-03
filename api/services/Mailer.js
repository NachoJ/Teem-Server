/**
 * Node Mailer service and setup
 */

var sails = require("sails");

var nodemailer = require("nodemailer");
var smtpTransport = require('nodemailer-smtp-transport');
// module.exports = nodemailer.createTransport('smtps://ankurgarach4%40gmail.com:garachankur4@smtp.gmail.com');


if (sails.config.mode === 'development') {
	// create reusable transporter object using the default SMTP transport
	module.exports = nodemailer.createTransport({
		service: 'gmail',
		auth: {
			user: sails.config.mail.useremail,
			pass: sails.config.mail.password
		}
	});
} else if (sails.config.mode === 'production') {

	module.exports = nodemailer.createTransport(smtpTransport({
		host: 'smtp.teemplayers.com',
		port: 587,

		auth: {
			user: sails.config.mail.useremail,
			pass: sails.config.mail.password
		},
		tls: {
			rejectUnauthorized: false
		}
	}));
}

require("email-templates")(sails.config.paths.views + '/email', function(err, template) {

	//console.log(err);
	//console.log(template);
	if (err)
		sails.log.warn(err);

	Mailer.template = template;
	//console.log(Mailer);
	//cb();
});