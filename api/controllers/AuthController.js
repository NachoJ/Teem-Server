var bcrypt = require('bcrypt');
var moment = require('moment');
var randomstring = require("randomstring");

module.exports = {
	Login: function (req, res) {
		var loginData = eval(req.body);
		//console.log("loginData", loginData);
		//loginData.active="1";
		User.findOneByEmail(loginData.email).exec(function (err, user) {
			if (err) {
				return res.badRequest({ error: "db error" });
			}
			if (!user)
				return res.badRequest({ error: "user with email address does not exists." });

			user.validatePassword(loginData.encryptedpassword, function (err, valid) {
				if (valid === false) {
					return res.badRequest({ error: "wrong password" });
				}
				if (!user.isactive) {
					return res.badRequest({ error: "please activate your account" });
				}
				var actJsn={
							userid: user.id,
							activitydate: new Date(),
							activitytype: "loggedin",
							onitem: "user"
					};

				return res.send({
						user: user,
						activity:actJsn
				});
			});
		});
	},

	RegisterUser: function (req, res) {
		//console.log(req.body);
		var registerData = eval(req.body);
		//console.log("registerData", registerData);
		if (!registerData.username && !registerData.email && !registerData.encryptpassword)
			return res.badRequest({ error: "Username, Email, Password is required" });

		var userData;

		async.series([
			function (usersCb) {
				User.create(registerData).exec(function (err, user) {
					if (err) {
						//	console.log("err", err);
						var errmsg = [];
						if (err.Errors) {
							var arrErrors = err.Errors;
							for (var k in arrErrors) {
								if (arrErrors.hasOwnProperty(k)) {
									errmsg.push(arrErrors[k][0].message);
								}
							}
						}
						usersCb({ error: errmsg.join(", ") });
						return;
					}

					user.sendActivationEmail(function (err, data, msg, token) {
						if (err)
							return res.serverError(err);
					});

					userData = {
						message: "Registered successfully. Please check your email to activate and login."
					};;

					usersCb(null, user);

				});
			}
		],
			function (err, finalresult) {
				if (err)
					res.badRequest(err);
				else
					res.send(userData);
			}
		);
	},

	ForgotPassword: function (req, res, next) {
		var fpData = eval(req.body);
		if (!fpData.email)
			return res.badRequest({ error: "Required email address" });

		User.findOneByEmail(req.body.email, function (err, user) {
			if (err)
				return res.serverError(err);

			if (!user)
				return res.badRequest({ error: "User with thie email address doesn't exist" });

			var jsonData = {
				passwordresettoken: randomstring.generate(25)
			};

			User.update({ id: user.id }, jsonData).exec(function (err, userupdate) {
				if (err) {
					return res.serverError(err);
				}
				//console.log("uerupdate",userupdate);
				if (userupdate) {
					userupdate[0].sendPasswordResetEmail(function (err, data, msg, token) {
						if (err)
							return res.serverError(err);
					});

					res.send({
						message: "Password reset instructions sent in email"
					});
				}
			});

		});
	},

	FbLogin: function (req, res, next) {
		var registerData = eval(req.body);
		//console.log('registerData',registerData);
		//return;
		if (!registerData.email)
			return res.badRequest({
				error: "Email is required"
			});

		if (!registerData.fbid)
			return res.badRequest({
				error: "Fb id is required"
			});

		var userData, userStore, userUpdateProfile;

		var email = registerData.email;
		//var fbid = registerData.fbid;
		//var username = registerData.username;
		var profileImage = registerData.profileimage;
		if (registerData.dob != "")
			registerData.dob = moment(new Date(registerData.dob)).toISOString();

		async.series([
			function (usersCb) {
				User.findOneByEmail(email).exec(function (err, user) {
					if (err)
						return res.serverError(err);

					userStore = user;
					//console.log("userStore", userStore);
					usersCb();
				});
			},
			function (createCb) {
				if (typeof userStore != "undefined") {
					createCb();
					return;
				}
				
				User.create(registerData).exec(function (err, result) {
					if (err) {
						return res.serverError(err);
					}
					userUpdateProfile = result;
					createCb();
				});
			},
			function (updateCb) {
				if (typeof userStore == "undefined") {
					updateCb();
					return;
				}
				delete registerData.city;

				if(registerData.dob=="")
					delete registerData.dob;

				User.update({ id: userStore.id }, registerData).exec(function (err, result) {
					if (err) {
						return res.serverError(err);
					}
					userUpdateProfile = result[0];
					updateCb();
				});
			},
			function (updateProfileCb) {
				var imageName = profileImage.split('/').pop().replace(/\#(.*?)$/, '').replace(/\?(.*?)$/, '');


				//console.log("userUpdateProfile", userUpdateProfile);
				if (userUpdateProfile && userUpdateProfile.profileimage != imageName) {

					var oldProfileImage = "";
					var userProfileImage = userUpdateProfile.profileimage;

					if (userProfileImage.indexOf("https://") == -1)
						oldProfileImage = user.profileimage;
					else
						oldProfileImage = "";

					uploadService.fbProfileImageService(profileImage, oldProfileImage, function (filename, log) {
						userUpdateProfile.profileimage = filename.image;
						userUpdateProfile.isactive = true;
						userUpdateProfile.activationlink = "";

						var jsonObj = {
							isactive: true,
							activationlink: "",
							profileimage: filename.image
						};

						
						User.update({ id: userUpdateProfile.id }, jsonObj).exec(function (err, userresult) {
							var actJsn={
									userid: userresult[0].id,
									activitydate: new Date(),
									activitytype: "loggedin",
									onitem: "user"
								};

							userData = {
								message: "Facebook login successfully.",
								data: userresult[0],
								activity:actJsn
							};
							updateProfileCb(null, userUpdateProfile);
						});
					});
				}
			}
		],
			function (err, finalresult) {
				if (err)
					res.badRequest(err);
				else
					res.send(userData);
			}
		);
	},

	UserActivation: function (req, res, next) {
		var usData = eval(req.body);
		//console.log("usData", usData);
		if (!usData.activationlink)
			return res.badRequest({ error: "Required activation key" });

		User.findOneByActivationlink(usData.activationlink, function (err, user) {
			if (err)
				return res.serverError(err);

			if (!user)
				return res.badRequest({ error: "User with activation link not found" });

			var jsonData = {
				isactive: true,
				activationlink: "",
				activateddate : moment().toISOString()
			};

			User.update({ id: user.id }, jsonData).exec(function (err, uerupdate) {
				if (err) {
					return res.serverError(err);
				}
				var actJsn={
							userid: uerupdate[0].id,
							activitydate: new Date(),
							activitytype: "activated",
							onitem: "user"
						};

				return res.send({
					message: "Your account has been activated. Welcome to Teem Players.",
					activity:actJsn
				});
			});
			// user.activateAccount(function (err) {
			// 	if (err) {
			// 		return res.serverError(err);
			// 	}

			// 	return res.send({
			// 		message: "Your account has been activated. Welcome to Teem Players."
			// 	});
			// });
		});
	},

	ResetPassword: function (req, res, next) {

		var resetData = eval(req.body);
		//console.log(resetData);
		User.findOneByPasswordresettoken(resetData.resetlink, function (err, user) {
			if (err)
				return res.serverError(err);
			if (!user)
				return res.badRequest({ error: "User with reset link not found" });


			//console.log("user", user);
			var jsonData = {
				encryptedpassword: resetData.password,
				passwordresettoken: ""
			};
			User.update({ id: user.id }, jsonData).exec(function (err, userupdate) {
				if (err) {
					return res.serverError(err);
				}
				//console.log("userupdate", userupdate);
				var actJsn={
							userid: userupdate[0].id,
							activitydate: new Date(),
							activitytype: "passwordreset",
							onitem: "user"
						};

				return res.send({
					message: "Reset password success.",
					activity:actJsn
				});
			});

		});
	},
	UpdatePassword: function (req, res) {
		var resetData = eval(req.body);
		//console.log(resetData);
		var userid = resetData.userid;
		var jsnRes = {};
		var oldpassword = resetData.oldpassword;

		delete resetData.userid;
		delete resetData.oldpassword;
		delete resetData.confirmpassword;

		//console.log("req", resetData);
		//return;
		async.series([
			function (userCb) {

				User.findOneById(userid).exec(function (err, userResult) {

					if (err) {
						userCb({ error: err });
						return;
					}

					if (typeof userResult == "undefined") {
						userCb({ error: 'User not found' });
						return;
					}
					if (!userResult.encryptedpassword || userResult.encryptedpassword == "") {
						userCb();
						return;
					}
					var matchPass = bcrypt.compareSync(oldpassword, userResult['encryptedpassword']);

					if (matchPass == false) {
						userCb({ error: "Your old password is not match" });
						return;
					}

					userCb();

				});
			},
			function (userUpdateCb) {

				User.update({ id: userid }, resetData).exec(function afterwards(err, updated) {

					if (err) {
						userCb({ error: err });
						return;
					}

					var actJsn={
							userid: updated[0].id,
							activitydate: new Date(),
							activitytype: "passwordupdated",
							onitem: "user"
						};

					jsnRes['message'] = "Password update successfully";
					jsnRes['activity']=actJsn;
					
					userUpdateCb();

				});
			}
		],
			function (err, finalresult) {
				if (err)
					res.badRequest(err);
				else
					res.send(jsnRes);
			});


	}
};