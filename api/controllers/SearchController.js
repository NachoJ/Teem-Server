var ObjectId = require('mongodb').ObjectID;

module.exports = {

	userAndSportcenterSearch: function(req, res) {
		var searchText = req.param("text");
		var userid = req.param("userid");
		//console.log("userid", userid);
		var followusers = [];
		var followsc = [];
		var userSearch, scSearch;

		var searchText = new RegExp(searchText, 'i');

		async.series([
				function(userCb) {

					User.find({ $or: [{ username: searchText }, { firstname: searchText }, { lastname: searchText }, { email: searchText }] }).exec(function(err, result) {
						if (err)
							return res.serverError(err);

						if (result.length == 0) {
							userCb();
							return;
						}
						userSearch = result;
						userCb();
					});
				},
				function(followCb) {
					Followers.find({ userid: userid }).exec(function(err, result) {
						if (err)
							return res.serverError(err);

						if (result.length == 0) {
							followCb();
							return;
						}
						result.forEach(function(index) {
							followusers.push(index.followinguserid);
						});
						followCb();
					});
				},
				function(scCb) {
					Sportcenter.find({ $or: [{ name: searchText }, { address: searchText }] }).populate('userid', { select: ['id', 'username', 'email', 'profileimage', 'dob', 'city', 'description', 'sports', 'firstname', 'lastname'] }).exec(function(err, result) {
						if (err)
							return res.serverError(err);

						if (result.length == 0) {
							scCb();
							return;
						}
						scSearch = result;
						scCb();
					});
				},
				function(folloscCb) {
					Followerssc.find({ userid: userid }).exec(function(err, result) {
						if (err)
							return res.serverError(err);

						if (result.length == 0) {
							folloscCb();
							return;
						}
						result.forEach(function(index) {
							followsc.push(index.scid);
						});
						folloscCb();
					});
				},
				
			],
			function(err, finalResult) {
				if (err)
					res.badRequest(err);
				else
					res.send({ data: { user: userSearch, sportcenter: scSearch,followusers:followusers,followsc:followsc } });
			});
	},

	addUserFollowers: function(req, res) {
		var reqData = eval(req.body);
		var actJsn;

		if (!reqData.userid || !reqData.followinguserid)
			return res.badRequest({ error: "userid or followinguserid required" });

		async.series([
				function(checkCb) {
					Followers.findOne({ $and: [{ userid: reqData.userid }, { followinguserid: reqData.followinguserid }] }).exec(function(err, result) {
						if (err)
							return serverError(err);

						if (typeof result != "undefined")
							return checkCb({ error: "you have already followed this user" });

						checkCb();
					});
				},
				function(userCb) {
					Followers.create(reqData).exec(function(err, result) {
						if (err) {
							var errmsg = [];
							if (err.Errors) {
								var arrErrors = err.Errors;
								for (var k in arrErrors) {
									if (arrErrors.hasOwnProperty(k)) {
										errmsg.push(arrErrors[k][0].message);
									}
								}
							}
							userCb({
								error: errmsg.join(", ")
							});
							return;
						}

						if (!result)
							return userCb({ error: "Something went wrong try again" });

						actJsn = {
							userid: result.userid,
							onactivityid: result.followinguserid,
							activitydate: new Date(),
							activitytype: "followinguser",
							onitem: "follow"
						};

						userCb();

					});
				}
			],
			function(err, finalResult) {
				if (err)
					res.badRequest(err);
				else
					res.send({ message: "Following successfully", activity: actJsn });
			});

	},

	addScFollowers: function(req, res) {
		var reqData = eval(req.body);
		var actJsn;

		if (!reqData.userid || !reqData.scid)
			return res.badRequest({ error: "userid or sportcenterid  required" });

		async.series([
				function(usercheckCb) {
					Followerssc.findOne({ $and: [{ userid: reqData.userid }, { scid: reqData.scid }] }).exec(function(err, result) {
						if (err)
							return serverError(err);

						if (typeof result != "undefined")
							return usercheckCb({ error: "You have already followed this sportcentre" });

						usercheckCb();
					});
				},
				function(followCb) {
					Followerssc.create(reqData).exec(function(err, result) {
						if (err) {
							var errmsg = [];
							if (err.Errors) {
								var arrErrors = err.Errors;
								for (var k in arrErrors) {
									if (arrErrors.hasOwnProperty(k)) {
										errmsg.push(arrErrors[k][0].message);
									}
								}
							}
							followCb({
								error: errmsg.join(", ")
							});
							return;
						}

						if (!result)
							return followCb({ error: "Something went wrong try again" });

						actJsn = {
							userid: result.userid,
							onactivityid: result.scid,
							activitydate: new Date(),
							activitytype: "followingsportcenter",
							onitem: "follow"
						}

						followCb();
					});
				}
			],
			function(err, finalResult) {
				if (err)
					res.badRequest(err);
				else
					res.send({ message: "Following successfully", activity: actJsn });
			});

	},

	unFollowed: function(req, res) {
		var type = req.param('type');
		var userid = req.param('userid');
		var followingid = req.param("followingid");
		var actJsn;

		console.log("reqData", type);

		if (type == "sportcenter") {
			Followerssc.destroy({ $and: [{ userid: userid }, { scid: followingid }] }).exec(function(err, result) {
				if (err)
					return res.serverError(err);

				if (result.length == 0)
					return res.badRequest({ error: "record not found" });

				actJsn = {
					userid: result[0].userid,
					onactivityid: result[0].scid,
					activitydate: new Date(),
					activitytype: "sportcenter",
					onitem: "unfollow"
				}

				res.send({ message: "Unfollowed successfully", activity: actJsn });
			});
		} else if (type == "user") {

			Followers.destroy({ $and: [{ userid: userid }, { followinguserid: followingid }] }).exec(function(err, result) {
				if (err)
					return res.serverError(err);

				if (result.length == 0)
					return res.badRequest({ error: "record not found" });

				actJsn = {
					userid: result[0].userid,
					onactivityid: result[0].followinguserid,
					activitydate: new Date(),
					activitytype: "user",
					onitem: "unfollow"
				}

				res.send({ message: "Unfollowed successfully", activity: actJsn });
			});
		}

	},

	userSearchDetail: function(req, res) {
		var userid = req.param("id");
		//console.log("profile", userid);
		userid = new ObjectId(userid);

		User.native(function(err, collection) {
			if (err)
				return nearByCb({ error: err });

			collection.aggregate([{
						$match: {
							$and: [{ '_id': userid }]
						}
					},
					{
						$lookup: {
							from: "followers",
							localField: "_id",
							foreignField: "followinguserid",
							as: "followers"
						}
					},
					{
						$unwind: {
							path: "$followers",
							preserveNullAndEmptyArrays: true
						}
					},
					{
						$lookup: {
							from: "user",
							localField: "followers.userid",
							foreignField: "_id",
							as: "followers.userdetail",
						}
					},
					{
						$group: {
							_id: "$_id",
							username: { $first: "$username" },
							email: { $first: "$email" },
							profileimage: { $first: "$profileimage" },
							dob: { $first: "$dob" },
							city: { $first: "$city" },
							description: { $first: "$description" },
							sports: { $first: "$sports" },
							firstname: { $first: "$firstname" },
							lastname: { $first: "$lastname" },
							followers: { $push: "$followers" }
						}
					},
					{
						$project: {
							_id: 1,
							username: 1,
							profileimage: 1,
							dob: 1,
							city: 1,
							description: 1,
							sports: 1,
							firstname: 1,
							lastname: 1,
							followers: {
								userdetail: {
									_id: 1,
									username: 1,
									profileimage: 1,
									dob: 1,
									city: 1,
									firstname: 1,
									lastname: 1,
								}
							}
						}
					}
				],
				function(err, result) {
					if (err)
						return res.badRequest(err);
					else
						return res.send({ data: result });
				});
		});
	},

	sportcenterSearchDetail: function(req, res) {
		var scid = req.param("id");
		//console.log("scid", scid);
		//scid="592588579802ffe11acaba71";
		scid = new ObjectId(scid);

		var scData;
		var subsportArr = [];

		async.series([
				function(scCb) {
					Sportcenter.native(function(err, collection) {
						if (err)
							return nearByCb({ error: err });

						collection.aggregate([{
									$match: {
										$and: [{ '_id': scid }]
									}
								},
								{
									$lookup: {
										from: "followerssc",
										localField: "_id",
										foreignField: "scid",
										as: "followers"
									}
								},
								{
									$unwind: {
										path: "$followers",
										preserveNullAndEmptyArrays: true
									}
								},
								{
									$lookup: {
										from: "user",
										localField: "followers.userid",
										foreignField: "_id",
										as: "followers.userdetail",
									}
								},
								{
									$lookup: {
										from: "fields",
										localField: "_id",
										foreignField: "scid",
										as: "fielddetail",
									}
								},
								{
									$group: {
										_id: "$_id",
										name: { $first: "$name" },
										address: { $first: "$address" },
										phone: { $first: "$phone" },
										dob: { $first: "$dob" },
										description: { $first: "$description" },
										lat: { $first: "$lat" },
										long: { $first: "$long" },
										followers: { $push: "$followers" },
										fielddetail: { $first: "$fielddetail" }
									}
								},
								{
									$project: {
										_id: 1,
										name: 1,
										address: 1,
										phone: 1,
										description: 1,
										lat: 1,
										long: 1,
										followers: {
											userdetail: {
												_id: 1,
												username: 1,
												profileimage: 1,
												dob: 1,
												city: 1,
												firstname: 1,
												lastname: 1,
											}
										},
										fielddetail: 1
									}
								}
							],
							function(err, result) {
								if (err)
									return scCb({ error: err });

								scData = result;
								scCb();
							});
					});
				},
				function(subsportCb) {
					if (scData[0].fielddetail.length == 0) {
						subsportCb();
						return;
					}
					Subsport.find({}).populate('sportid').exec(function(err, result) {
						if (err)
							return res.serverError(err);

						result.forEach(function(index) {
							subsportArr[index.id] = index;
						});
						subsportCb();
					});
				},
				function(fieldCb) {
					if (scData[0].fielddetail.length == 0) {
						fieldCb();
						return;
					}
					//console.log("scData",scData);
					scData[0].fielddetail.forEach(function(index) {
						//console.log("index",index.fielddetail);
						var sport = index.sport;
						//console.log("sport",sport);
						var sportText = [];
						sport = sport.split(",");
						sport.forEach(function(index) {
							if (index == subsportArr[index].id) {
								sportText.push(subsportArr[index].sportid.title + "(" + subsportArr[index].title + ")");
							}
						});

						index['sportdetail'] = sportText;

					});
					//console.log("scData",scData);
					fieldCb();
				}
			],
			function(err, finalResult) {
				if (err)
					res.badRequest(err);
				else
					res.send({ data: scData });
			});

	},

	userFollowers:function(req,res){
		var userid=req.param("userid");
		var userData;

		async.series([
			function(userCb){
				Followers.find({followinguserid:userid}).populate("userid",{select:['username','firstname','lastname','city','dob','profileimage']}).exec(function(err,result){
						if(err)
							return res.serverError(err);

						if(result.length==0){
							userCb();
							return;
						}
						userData=result;
						userCb();		
				})
			}
		],
		function(err,finalResult){
			if(err)
				res.badRequest(err);
			else
				res.send({data:userData});
		});
	},

		userFollowing:function(req,res){
		var userid=req.param("userid");
		var userData;

		async.series([
			function(userCb){
				Followers.find({userid:userid}).populate("followinguserid",{select:['username','firstname','lastname','city','dob','profileimage']}).exec(function(err,result){
						if(err)
							return res.serverError(err);

						if(result.length==0){
							userCb();
							return;
						}
						userData=result;
						userCb();		
				})
			}
		],
		function(err,finalResult){
			if(err)
				res.badRequest(err);
			else
				res.send({data:userData});
		});
	}

};