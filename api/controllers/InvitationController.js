var ObjectId = require('mongodb').ObjectID;
var _ = require("lodash");
var moment = require("moment");
module.exports = {

	createInvitation: function(req, res) {

		var reqData = eval(req.body);
		var userids = [];
		var userid = reqData.userid;
		var matchidLink = reqData.matchid;

		userids = userid.split(",");
		var useridIndex, invitationIdLink;
		delete reqData.userid;

		async.series([
			function(notinviteCb) {
				Invitation.find({ $and: [{ userid: { $in: userids } }, { matchid: reqData.matchid }] }).exec(function(err, invitationresult) {
					if (invitationresult.length > 0) {
						invitationresult.forEach(function(index) {
							if (userids.indexOf(index.userid) > -1) {
								useridIndex = userids.indexOf(index.userid);
								userids.splice(useridIndex, 1);
							}
						});
					}
				});
				notinviteCb();
			},
			function(notteamCb) {
				Team.find({ $and: [{ userid: { $in: userids } }, { matchid: reqData.matchid }] }).exec(function(err, teamresult) {
					if (teamresult.length > 0) {
						teamresult.forEach(function(index) {
							if (userids.indexOf(index.userid) > -1) {
								useridIndex = userids.indexOf(index.userid);
								userids.splice(useridIndex, 1);
							}
						});
					}
				});
				notteamCb();
			},
			function(inviateCb) {
				if (userids.length == 0) {
					inviateCb();
					return;
				}
				userids.forEach(function(index) {
					reqData.userid = index;

					User.findOneById(reqData.inviterid).exec(function(err, inviterresult) {
						User.findOneById(index).exec(function(err, userresult) {
							Jobs.create('sendInvitation', { user: userresult, inviter: inviterresult, invitationid: matchidLink }).save(function(err, data, msg, token) {});
						});
					});

					Invitation.create(reqData).exec(function(err, result) {
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
							inviateCb({ error: errmsg.join(", ") });
							return;
						}
					})
				});
				inviateCb();
			}
		], function(err, finalResult) {
			if (err)
				res.badRequest(err);
			else
				res.send({ "message": "Invitation send successfully" });
		})

	},
	DeleteInvitation: function(req, res) {
		var id = req.param("id");

		Invitation.destroy({ id: id }).exec(function(err, result) {
			if (err)
				return res.serverError(err);


			console.log("result", result);
			if (result.length == 0)
				return res.badRequest({ error: "Invitation not found" });

			var actJsn = {
				userid: result[0].userid,
				activitydate: new Date(),
				activitytype: "delete",
				onitem: "invitation"
			};
			res.send({ "message": "Invitation delete successfully", activity: actJsn });

		});
	},
	// invitationList: function (req, res) {
	//     var type = req.param("type");
	//     var id = req.param("id");
	//     console.log(type);
	//     console.log(id);

	//     var queryBy;
	//     if (type == "user")
	//         queryBy = { userid: id };
	//     else if (type == "inviter")
	//         queryBy = { inviterid: id };

	//     Invitation.find(queryBy).exec(function (err, result) {
	//         if (err)
	//             return res.serverError(err);

	//         if (result.length == 0)
	//             res.badRequest({ error: "Invitation not found" });

	//         res.send({ data: result });

	//     });
	// },
	invitationList: function(req, res) {
		var id = req.param("id");
		id = new ObjectId(id);
		var userdate = req.param("date");
		//userdate=new Date(userdate);
		userdate = moment(userdate, "YYYY-MM-DD HH:mm.Z").toDate();
		var invitation;
		var matchIds = [];
		async.series([
			function(inviteCb) {
				Invitation.native(function(err, collection) {
					if (err)
						return nearByCb({ error: err });

					collection.aggregate([

							{
								$lookup: {
									from: "match",
									localField: "matchid",
									foreignField: "_id",
									as: "matchdetail"
								}
							},
							{
								$match: {
									$and: [{ 'userid': id }, { accepted: "no" }, { "matchdetail.matchtime": { $gt: userdate } }]
								}
							},
							{
								$unwind: {
									path: "$matchdetail",
									preserveNullAndEmptyArrays: true
								}
							},
							{
								$lookup: {
									from: "user",
									localField: "userid",
									foreignField: "_id",
									as: "userdetail",
								}
							},
							{
								$lookup: {
									from: "user",
									localField: "inviterid",
									foreignField: "_id",
									as: "inviteruserdetail",
								}
							},
							{
								$lookup: {
									from: "user",
									localField: "matchdetail.userid",
									foreignField: "_id",
									as: "matchdetail.userdetail",
								}
							},
							{
								$lookup: {
									from: "sportcenter",
									localField: "matchdetail.scid",
									foreignField: "_id",
									as: "matchdetail.sciddetail",
								}
							},
							{
								$lookup: {
									from: "subsport",
									localField: "matchdetail.subsportid",
									foreignField: "_id",
									as: "matchdetail.subsport",
								}
							},
							{
								$lookup: {
									from: "sport",
									localField: "matchdetail.sport",
									foreignField: "_id",
									as: "matchdetail.sportdetail",
								}
							},
							{
								$group: {
									_id: "$_id",
									matchid: { $first: "$matchid" },
									userdetail: { $first: "$userdetail" },
									inviteruserdetail: { $first: "$inviteruserdetail" },
									matchdetail: { $push: "$matchdetail" }
								}
							},
							{
								$project: {
									_id: 1,
									matchid: 1,
									userdetail: 1,
									inviteruserdetail: 1,
									matchdetail: {
										$filter: { input: "$matchdetail", as: "matchdetail", cond: { $ifNull: ["$$matchdetail._id", false] } }
									}
								}
							}

						],
						function(err, result) {
							if (err)
								return res.serverError(err);

							if (result.length == 0)
								return inviteCb({ error: "Invitation not found" });

							result.forEach(function(index) {
								index['totalmatchplayer'] = 0;
								matchIds.push(index.matchdetail[0]._id);
							});
							matchIds = _.uniq(matchIds, false);
							matchIds = matchIds.map(function(obj) { return ObjectId(obj) });

							invitation = result;
							//console.log("invitation", invitation);
							//return;
							inviteCb();
						});
				});

				// Invitation.find({ $and: [{ userid: id }, { accepted: "no" }] }).populateAll().exec(function (err, result) {
				//     if (err)
				//         return res.serverError(err);

				//     if (result.length == 0)
				//         return res.badRequest({ error: "Invitation not exists" });

				//     result.forEach(function (index) {
				//         index['totalmatchplayer'] = 0;
				//         matchIds.push(index.matchid.id);
				//     })

				//     invitation = result;
				//     //console.log("invitation",invitation);
				//     matchIds = _.uniq(matchIds, false);
				//     // matchIds=["58e7a07147b80bb554ebe3fd","58ef683f562da9dd5d9099c1"];
				//     matchIds = matchIds.map(function (obj) { return ObjectId(obj) });
				//     //console.log(matchIds);
				//     inviteCb();
				// });
			},
			function(teamCb) {
				Team.native(function(err, collection) {
					if (err)
						return nearCb({ error: err });

					collection.aggregate([{
								$match: {
									matchid: { $in: matchIds }
								}
							},
							{
								$group: {
									_id: {
										matchid: "$matchid"
									},
									count: {
										$sum: 1
									}
								}
							}
						],
						function(err, result) {
							if (err)
								return res.serverError(err);

							result.forEach(function(index) {
								var rid = index['_id']['matchid'];
								invitation.forEach(function(invite) {
									var matchid = invite.matchid

									if (rid + "" == matchid + "") {
										invite.totalmatchplayer = index['count'];
									}
								});
							});
							teamCb();
						}
					);
				});
			}


		], function(err, finalResult) {
			if (err)
				res.badRequest(err);
			else
				res.send({ data: invitation });

		});

	},

	userSearchList: function(req, res) {
		var text = req.param("text");
		var id = req.param("id");
		User.find({ id: { $ne: id }, $or: [{ email: new RegExp(text, 'i') }, { username: new RegExp(text, 'i') }, { firstname: new RegExp(text, 'i') }, { lastname: new RegExp(text, 'i') }], select: ['firstname', 'lastname', 'profileimage', 'username', 'email'] })
			.exec(function(err, result) {
				if (err)
					return res.serverError(err);

				if (result.length == 0)
					return res.badRequest({ error: 'User not exists' });

				res.send({ data: result });
			});
	},

	acceptInvitationByUser: function(req, res) {
		var userid = req.param("id");
		var invitaionid = req.param("invitationid");
		var invitationData, teamObj;

		async.series([
				function(userCb) {
					Invitation.findOne({ $and: [{ userid: userid }, { id: invitaionid }] })
						.then(function(invite) {
							var match = Match.findOneById(invite.matchid).populate("subsportid")
								.then(function(match) {
									return match;
								});
							return [invite, match]
						})
						.spread(function(invite, match) {
							invite = invite.toObject();
							invite.matchdetail = match;
							invitationData = invite;
							userCb();
						});

					// Invitation.findOne({ $and: [{ userid: userid }, { id: invitaionid }] }).populate('matchid').exec(function (err, result) {
					//     if (err)
					//         return res.serverError(err);

					//     if (typeof result == "undefined")
					//         return userCb({ error: "Invitation not exists" });

					//     invitationData = result;
					//     userCb();
					// });
				},
				function(teamCountCb) {
					var matchId = invitationData.matchid;
					var totalPlayer = invitationData.matchdetail.subsportid.value + invitationData.matchdetail.subsportid.value;
					//  totalPlayer=4;
					// console.log("totalPlayer", totalPlayer);
					// console.log("invitationData", invitationData);
					Team.count({ $and: [{ matchid: matchId }] }).exec(function(err, matchTotalResult) {
						if (err)
							return res.serverError(err);

						if (matchTotalResult == totalPlayer) {
							return teamCountCb({ error: "Team is full" });
						}
						teamCountCb();
					});
				},
				function(teamFindCb) {
					var matchId = invitationData.matchid;
					Team.count({ $and: [{ matchid: matchId }, { teamid: 1 }] }).exec(function(err, matchResult) {
						if (err)
							return res.serverError(err);

						//invitationData.matchdetail.subsportid.value=2;    
						console.log("matchResult", matchResult);
						if (matchResult < invitationData.matchdetail.subsportid.value) {
							teamObj = {
								userid: userid,
								matchid: matchId,
								teamid: 1
							}
							teamFindCb();
						} else {
							Team.count({ $and: [{ matchid: matchId }, { teamid: 2 }] }).exec(function(err, resultMatch) {
								if (err)
									return res.serverError(err);

								//  invitationData.matchdetail.subsportid.value=2;
								if (resultMatch < invitationData.matchdetail.subsportid.value) {
									teamObj = {
										userid: userid,
										matchid: matchId,
										teamid: 2
									}
								}
								teamFindCb();
							});
						}
					});
				},
				function(invitationCb) {
					Invitation.update({ $and: [{ userid: userid }, { id: invitaionid }] }, { accepted: 'yes' }).exec(function(err, result) {
						if (err)
							return res.serverError(err);

						if (!result.length)
							return invitationCb({ error: "Invitation update failed" });

						actJsn = {
							userid: result[0].userid,
							onactivityid: result[0].matchid,
							activitydate: result[0].updatedAt,
							activitytype: "accept invitation",
							onitem: "invitation"
						};
						invitationCb();
					});
				},
				function(teamCb) {
					if (typeof teamObj == "undefined") {
						teamCb();
						return;
					}

					Team.create(teamObj).exec(function(err, result) {
						if (err)
							return res.serverError(err);

						if (result.length == 0)
							return res.badRequest({ error: "Team not create" });

						teamCb();
					});
				}
			],
			function(err, finalResult) {
				if (err)
					res.badRequest(err);
				else
					res.send({ message: "Invitation accept successfully", activity: actJsn });
			});
	}


}