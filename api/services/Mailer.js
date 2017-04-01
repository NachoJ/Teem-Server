/**
 * Node Mailer service and setup
 */

var sails = require("sails");

var nodemailer = require("nodemailer");
// module.exports = nodemailer.createTransport('smtps://ankurgarach4%40gmail.com:garachankur4@smtp.gmail.com');

module.exports = nodemailer.createTransport({
  service: 'Gmail',
  auth: {
    user: 'ankurgarach4@gmail.com',
    pass: 'garach@4'
  }
});

require("email-templates")(sails.config.paths.views + '/email', function(err, template) {

	//console.log(err);
	//console.log(template);
	if (err)
		sails.log.warn(err);

	Mailer.template = template;
	//console.log(Mailer);
	//cb();
});
