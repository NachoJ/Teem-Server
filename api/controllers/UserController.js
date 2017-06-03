var moment = require('moment');
var fs = require("fs");

module.exports = {

	ProfileUpdate: function(req, res) {
		var reqData = eval(req.body);

		var userid = reqData.userid;
		delete reqData.userid;

		reqData.dob = moment(new Date(reqData.dob)).toISOString();

		User.update({ id: userid }, reqData).exec(function afterwards(err, userData) {
			if (err) {
				res.serverError(err);
			}
			if (!userData.length) {
				return res.badRequest({ error: "User record not found in our database" });
			}
			var actJsn = {
				userid: userData[0].id,
				activitydate: new Date(),
				activitytype: "profileUpdated",
				onitem: "user"
			};
			res.send({ data: userData[0], message: "User update successfully", activity: actJsn });
		});
	},

	profileImageUpload: function(req, res) {

		var userid = req.param("userid");
		var reqData = {};

		var folderPath = sails.config.paths.public;
		var imagePath = folderPath + '/upload/profiles';
		var origifilename = req.file('profile')._files[0].stream.filename;

		var newfilename = moment().utc().unix() + "_" + origifilename;

		User.findOneById(userid).exec(function(err, result) {
			if (err)
				return res.serverError(err);

			if (typeof result == "undefined")
				return res.badRequest({ error: "User not found" });

			req.file('profile').upload({
				saveAs: newfilename,
				dirname: imagePath
			}, function whenDone(err, uploadedFiles) {
				if (err) {
					return res.negotiate(err);
				}

				if (uploadedFiles.length === 0) {
					return res.badRequest('No file was uploaded');
				}

				reqData['profileimage'] = newfilename;

				if (result.profileimage != "") {
					fs.unlink(imagePath + '/' + result.profileimage, function(err) {
						if (err)
							console.log(err);
					});
				}

				User.update({ id: userid }, reqData).exec(function afterwards(err, userData) {
					if (err) {
						res.serverError(err);
					}
					if (!userData.length) {
						return res.badRequest({ error: "User record not found in our database" });
					}
					var actJsn = {
						userid: userData[0].id,
						activitydate: new Date(),
						activitytype: "profileUpdated",
						onitem: "user"
					};

					res.send({ data: userData[0], message: "User update successfully", activity: actJsn });
				});
			});
		});
	},

	connectSocket: function(req, res) {
		var userid = req.param("userid");
		//console.log("userid",userid);

		User.findOneById(userid).exec(function(err, result) {
			if (err)
				return res.serverError(err);

			if (typeof result == "undefined")
				return res.badRequest({ error: "User not found" });

			User.update({ id: userid }, { isonline: true }).exec(function(err, updateresult) {
				
				User.subscribe(req, result, ['message']);
				User.watch(req);

				res.ok();
			});
		});
	}

};