/**
 * Node Mailer service and setup
 */

var sails = require("sails");

var nodemailer = require("nodemailer");
var smtpTransport = require('nodemailer-smtp-transport');
// module.exports = nodemailer.createTransport('smtps://ankurgarach4%40gmail.com:garachankur4@smtp.gmail.com');

module.exports = nodemailer.createTransport(smtpTransport({
  host: 'smtp.teemplayers.com',
	port:587,
	
  auth: {
    user: 'teemplayers@teemplayers.com',
    pass: 'Candidato98S12'
  },
	 tls: {
        rejectUnauthorized:false
    }
}));

require("email-templates")(sails.config.paths.views + '/email', function(err, template) {

	//console.log(err);
	//console.log(template);
	if (err)
		sails.log.warn(err);

	Mailer.template = template;
	//console.log(Mailer);
	//cb();
});
