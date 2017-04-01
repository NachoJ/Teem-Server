/**
 * User
 *
 * @module      :: Model
 * @description :: This is the User model
 * @docs        :: http://sailsjs.org/#!documentation/models
 */

var bcrypt = require('bcrypt'),
	uuid = require("uuid"),
	_ = require("lodash");

var randomstring = require("randomstring");
var moment = require('moment');
// var sails = require("sails");

module.exports = {

	schema: true,

	attributes: {

		firstname: {
			type: 'string'
		},

		lastname: {
			type: 'string'
		},
		profileimage: {
			type: 'string',
			defaultsTo: ""
		},
		profilethumbimage: {
			type: 'string',
			defaultsTo: ""
		},
		username: {
			type: 'string',
			required: true,
			unique: true
		},
		email: {
			type: 'email',
			required: true,
			unique: true
		},
		fbid: {
			type: 'string',
			unique: true
		},
		encryptedpassword: {
			type: 'string'
		},

		isactive: {
			type: 'boolean',
			enum: [true, false],
			defaultsTo: false
		},
		passwordresettoken: {
			type: 'string',
			defaultsTo: ''
		},

		activationlink: {
			type: 'string',
			defaultsTo: randomstring.generate(25)
		},
		createdAt: {
			type: 'datetime'
		},
		updatedAt: {
			type: 'datetime'
		},
		activateddate: {
			type: 'datetime'
		},
		/**
		 * Get user's full name
		 */
		fullName: function() {
			// return _.compact([this.firstname, this.lastname]).join(' ');
			return _.compact([this.username]).join(' ');
		},

		/**
		 * Custom toJSON() implementation. Removes unwanted attributes.
		 */

		toJSON: function() {
			var user = this.toObject();
			delete user.password;
			delete user.encryptedpassword;
			delete user.sessionTokens;
			delete user._csrf;
			return user;
		},

		/**
		 * Check if the supplied password matches the stored password.
		 */

		validatePassword: function(candidatePassword, cb) {
			bcrypt.compare(candidatePassword, this.encryptedpassword, function(err, valid) {
				if (err) return cb(err);
				cb(null, valid);
			});
		},

		/**
		 * Generate password reset token
		 */

		generatePasswordResetToken: function(cb) {
			this.passwordresettoken = randomstring.generate(25);
			this.save(function(err) {
				if (err) return cb(err);
				cb();
			});
		},

		activateAccount: function(cb) {
			this.isactive = true;
			this.activationlink = "";
			this.activateddate = moment().toISOString();
			this.save(function(err) {
				if (err)
					return cb(err);
				cb();
			});
		},

		sendActivationEmail: function(cb) {
			var self = this;

			// this.generatePasswordResetToken(function (err) {
			//   if(err) return cb(err);

			// Send email
			var email = new Email._model({
				to: {
					name: self.fullName(),
					email: self.email
				},
				subject: "Activate your Teem Account",
				data: {
					fullname: self.fullName(),
					activationlink: sails.config.siteUrl + '/auth/login/' + self.activationlink
				},
				tags: ['activation', 'transactional'],
				template: 'activation'
			});

			email.setDefaults();

			email.send(function(err, res, msg) {
				cb(err, res, msg, "token");
			});
			// });
		},
		/**
		 * Send password reset email
		 *
		 * Generate a password reset token and send an email to the user with
		 * instructions to reset their password
		 */

		sendPasswordResetEmail: function(cb) {
			var self = this;

			this.generatePasswordResetToken(function(err) {
				if (err) return cb(err);

				// Send email
				var email = new Email._model({
					to: {
						name: self.fullName(),
						email: self.email
					},
					subject: "Reset your Teem password",
					data: {
						resetURL: sails.config.siteUrl + '/auth/resetpassword/' + self.passwordresettoken
					},
					tags: ['password-reset', 'transactional'],
					template: 'password-reset'
				});

				email.setDefaults();

				email.send(function(err, res, msg) {
					cb(err, res, msg, "token");
				});
			});
		}

	},

	/**
	 * Functions that run before a user is created
	 */

	validationMessages: { //hand for i18n & l10n
		email: {
			required: 'Email is required',
			email: 'Provide valid email address',
			unique: 'Email address is already taken'
		},
		username: {
			required: 'Username is required',
			unique: 'Username is already taken'
		}
	},

	beforeCreate: [
		// Encrypt user's password
		function(values, cb) {
			if(!values.fbid){
				if (!values.password ) {
					return cb({
						err: "Password required!"
					});
				}
				
				User.encryptPassword(values, function(err) {
					cb(err);
				});
			}else{
				cb();
			}
		},

		// Create an API key
		function(values, cb) {
			values.apiKey = uuid.v4();
			cb();
		}
	],

	/**
	 * Functions that run before a user is updated
	 */

	beforeUpdate: [
		// Encrypt user's password, if changed
		function(values, cb) {
			if (!values.password) {
				return cb();
			}

			User.encryptPassword(values, function(err) {
				cb(err);
			});
		}
	],

	/**
	 * User password encryption. Uses bcrypt.
	 */

	encryptPassword: function(values, cb) {
		bcrypt.hash(values.password, 10, function(err, encryptedpassword) {
			if (err) return cb(err);
			values.encryptedpassword = encryptedpassword;
			cb();
		});
	}

	/**
	 * Consume a user's session token
	 */
};