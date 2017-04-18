var randomstring = require("randomstring");

module.exports = {
    schema: true,

    attributes: {

        userid: {
            model: 'user',
            required: true
        },
        email: {
            type:'string',
            required: true
        },
        activationlink: {
           type: 'string',
			defaultsTo: randomstring.generate(25)
        },
        sendChangeActivationEmail: function(name,cb) {
			var self = this;

			// Send email
			var email = new Email._model({
				to: {
					name: name,
					email: self.email
				},
				subject: "Change your Teem Account email",
				data: {
					fullname: name,
					activationlink: sails.config.siteUrl + '/settings/email/' + self.activationlink
				},
				tags: ['activation', 'transactional'],
				template: 'activation'
			});

			email.setDefaults();

			email.send(function(err, res, msg) {
				cb(err, res, msg, "token");
			});
			// });
		}
    }
}