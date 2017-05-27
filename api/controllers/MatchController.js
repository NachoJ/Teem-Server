var _$ = require("lodash");
var ObjectId = require('mongodb').ObjectID;
var moment = require("moment");

module.exports = {

	CreateMatch: function(req, res) {
		var reqData = eval(req.body);
		var dataObj, actObj;
		var sportDetail, fieldDetail;

		async.series([
				function(scCb) {
					Sportcenter.findOneById(reqData.scid).exec(function(err, scData) {
						if (err) {
							res.serverError(err);
							return;
						}

						if (typeof scData == "undefined") {
							scCb({ error: "Sportcenter not found" });
							return;
						}

						sportDetail = scData;
						scCb();
					})
				},
				function(fieldCb) {
					Fields.findOneById(reqData.fieldid).exec(function(err, fieldData) {
						if (err) {
							res.serverError(err);
							return;
						}

						if (typeof fieldData == "undefined") {
							fieldCb({ error: "Field not found" });
							return;
						}

						fieldDetail = fieldData;
						fieldCb();
					})
				},
				function(matchCb) {
					reqData.coordinates = [parseFloat(sportDetail.long), parseFloat(sportDetail.lat)];

					reqData.matchtime = moment(reqData.matchtime, "YYYY-MM-DD HH:mm:ss.Z").toDate();

					Match.create(reqData).exec(function(err, matchData) {
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
							matchCb({
								error: errmsg.join(", ")
							});
							return;
						}
						if (!matchData) {
							return matchCb({ error: "Metch not create.Please try again" });
						}
						dataObj = matchData;
						actObj = {
							userid: dataObj.userid,
							activitydate: dataObj.createdAt,
							activitytype: "added",
							onitem: "match",
							onactivityid: dataObj.id
						}
						//console.log("match",matchData);
						matchCb();
					});
				},
				function(teamCb) {
					var teamObj = {
						matchid: dataObj.id,
						userid: dataObj.userid,
						teamid: 1
					};

					Team.create(teamObj).exec(function(err, result) {
						if (err)
							return res.serverError(err);

						if (!result)
							return teamCb({ error: "Team not create.Please try again" });

						teamCb();
					});
				}
			],
			function(err, finalResult) {
				if (err)
					res.badRequest(err);
				else
					res.send({ message: "Match create successfully", data: dataObj, activity: actObj });
			})

	},

	ListMatch: function(req, res) {
		Match.find().populateAll().exec(function(err, filedData) {
			if (filedData.length > 0) {
				res.send({ data: filedData })
			} else {
				res.badRequest({ error: "Matches not found" })
			}

		});
	},

	SingleMatchDisplay: function(req, res) {
		var matchid = req.param("id");
		var matchObj;
		var teamArr = { teamid1: [], teamid2: [] };

		async.series([
			function(matchCb) {
				Match.find({ id: matchid }).populateAll().exec(function(err, matchData) {
					if (err) {
						res.serverError(err);
						return;
					}
					if (matchData.length == 0) {
						matchCb({ error: "This match id not found in our database" });
						return;
					}
					matchObj = matchData;
					matchCb();
				});
			},
			function(teamCb) {
				var matchId = matchObj[0].id;
				Team.find({ matchid: matchId }).populate("userid").exec(function(err, teamResult) {
					if (err) {
						res.serverError(err);
						return;
					}
					if (teamResult.length == 0) {
						Match.subscribe(req, _.pluck(matchObj, 'id'), ['message', 'destroy', 'update']);
						Match.watch(req);
						teamCb();
						return;
					}
					teamResult.forEach(function(index) {
						if (index.teamid == 1) {
							teamArr.teamid1.push(index);
						} else if (index.teamid == 2) {
							teamArr.teamid2.push(index);
						}
					});

					matchObj[0]['team'] = teamArr;

					Match.subscribe(req, _.pluck(matchObj, 'id'), ['message', 'destroy', 'update']);
					Match.watch(req);

					teamCb();
				});
			}
		], function(err, finalResult) {
			if (err)
				res.badRequest(err);
			else
				res.send({ data: { data: matchObj, type: "matchsubscribe" } });

		});

	},

	DeleteMatch: function(req, res) {
		var matchid = req.param("id");

		if (!matchid)
			return res.badRequest({ message: "Match id is reqired" });

		Match.destroy({ id: matchid }).exec(function(err, matchData) {
			if (err) {
				res.serverError(err);
				return;
			}
			if (matchData.length == 0) {
				res.badRequest({ error: "This Match id not found in our database" });
				return;
			}
			res.send({ message: "Match delete successfully" });
		});
	},

	UpdateMatch: function(req, res) {
		var reqData = eval(req.body);
		var matchid = reqData.id;
		delete reqData.id;
		var sportDetail, fieldDetail;

		if (!matchid)
			return res.badRequest({ error: "Match id is reqired" });

		async.series([
				function(scCb) {
					if (!reqData.scid) {
						scCb();
						return;
					}
					Sportcenter.findOneById(reqData.scid).exec(function(err, scData) {
						if (err) {
							res.serverError(err);
							return;
						}

						if (typeof scData == "undefined") {
							scCb({ error: "Sportcenter not found" });
							return;
						}

						sportDetail = scData;
						scCb();
					})
				},
				function(fieldCb) {
					if (!reqData.fieldid) {
						fieldCb();
						return;
					}
					Fields.findOneById(reqData.fieldid).exec(function(err, fieldData) {
						if (err) {
							res.serverError(err);
							return;
						}

						if (typeof fieldData == "undefined") {
							fieldCb({ error: "Field not found" });
							return;
						}

						fieldDetail = fieldData;
						fieldCb();
					})
				},
				function(matchCb) {
					if (sportDetail) {
						reqData.coordinates = [parseFloat(sportDetail.long), parseFloat(sportDetail.lat)];
					}
					if (fieldDetail)
						reqData.sport = fieldDetail.sport;

					Match.update({ id: matchid }, reqData).exec(function afterwards(err, matchData) {
						if (err) {
							res.serverError(err);
						}
						if (!matchData.length) {
							matchCb({ error: "Match record not found in our database" });
						}
						matchCb();

					});
				}
			],
			function(err, finalResult) {
				if (err)
					res.badRequest(err);
				else
					res.send({ message: "Match update successfully" });
			});
	},
	FindNearByMatch: function(req, res) {
		var reqData = eval(req.body);
		var sendResult;
		var sport = reqData.sport;
		var matchdate = reqData.date;
		var matchId = [];
		var conditions = {
			long: parseFloat(reqData.long) || 0,
			lat: parseFloat(reqData.lat) || 0,
			maxDistance: parseFloat(reqData.maxdistance) || 1500,
		};

		async.series([
			function(nearCb) {
				if (sport == "all") {
					nearCb();
					return;
				}
				sport = new ObjectId(sport);

				Match.native(function(err, collection) {
					if (err)
						return nearCb({ error: err });

					collection.aggregate([{
							$geoNear: {
								near: {
									type: "Point",
									coordinates: [conditions.long, conditions.lat]
								},
								maxDistance: conditions.maxDistance * 1000.0,
								distanceMultiplier: 0.001,
								spherical: true,
								distanceField: "distance"
							},
						},
						{
							$match: {
								$and: [{ 'matchtime': { $gte: moment(matchdate, "YYYY-MM-DD HH:mm:ss.Z").toDate() } }, { $or: [{ 'sport': sport }, { 'subsportid': sport }] }]
							}
						},
						{
							$lookup: {
								from: "user",
								localField: "userid",
								foreignField: "_id",
								as: "userdetail"
							}
						},
						{
							$lookup: {
								from: "sportcenter",
								localField: "scid",
								foreignField: "_id",
								as: "sportcenterdetail"
							}
						},
						{
							$lookup: {
								from: "sport",
								localField: "sport",
								foreignField: "_id",
								as: "sportdetail"
							}
						},
						{
							$lookup: {
								from: "subsport",
								localField: "subsportid",
								foreignField: "_id",
								as: "subsportdetail"
							}
						},
						{
							$project: {
								fieldid: 1,
								benchplayers: 1,
								matchtime: 1,
								paymenttype: 1,
								currency: 1,
								price: 1,
								coordinates: 1,
								sport: 1,
								address: 1,
								distance: 1,
								userdetail: {
									username: 1,
									profileimage: 1,
									profilethumbimage: 1,
									sports: 1,
									city: 1
								},
								sportcenterdetail: 1,
								sportdetail: 1,
								subsportdetail: 1
							}
						}

					], function(err, result) {
						if (err)
							return nearCb({ error: err });

						result.forEach(function(index) {
							index['matchplayercount'] = 0;
							matchId.push(index._id);
						});

						matchId = _$.uniq(matchId, false);
						matchId = matchId.map(function(obj) { return ObjectId(obj) });
						sendResult = result;

						nearCb();
					});
				});
			},
			function(nearByCb) {
				if (sport != "all") {
					nearByCb();
					return;
				}
				Match.native(function(err, collection) {
					if (err)
						return nearByCb({ error: err });

					collection.aggregate([{
							$geoNear: {
								near: {
									type: "Point",
									coordinates: [conditions.long, conditions.lat]
								},
								maxDistance: conditions.maxDistance * 1000.0,
								distanceMultiplier: 0.001,
								spherical: true,
								distanceField: "distance"
							},

						},
						{
							$match: {
								$and: [{ 'matchtime': { $gte: moment(matchdate, "YYYY-MM-DD HH:mm:ss.Z").toDate() } }]
							}
						},
						{
							$lookup: {
								from: "user",
								localField: "userid",
								foreignField: "_id",
								as: "userdetail"
							}
						},
						{
							$lookup: {
								from: "sportcenter",
								localField: "scid",
								foreignField: "_id",
								as: "sportcenterdetail"
							}
						},
						{
							$lookup: {
								from: "sport",
								localField: "sport",
								foreignField: "_id",
								as: "sportdetail"
							}
						},
						{
							$lookup: {
								from: "subsport",
								localField: "subsportid",
								foreignField: "_id",
								as: "subsportdetail"
							}
						},
						{
							$project: {
								fieldid: 1,
								benchplayers: 1,
								matchtime: 1,
								paymenttype: 1,
								currency: 1,
								price: 1,
								coordinates: 1,
								sport: 1,
								address: 1,
								distance: 1,
								userdetail: {
									username: 1,
									profileimage: 1,
									profilethumbimage: 1,
									sports: 1,
									city: 1
								},
								sportcenterdetail: 1,
								sportdetail: 1,
								subsportdetail: 1
							}
						}
					], function(err, result) {
						if (err)
							return nearByCb({ error: err });

						result.forEach(function(index) {
							index['matchplayercount'] = 0;
							matchId.push(index._id);
						});

						matchId = _$.uniq(matchId, false);
						matchId = matchId.map(function(obj) { return ObjectId(obj) });
						sendResult = result

						nearByCb();
					});
				});
			},
			function(countCb) {
				Team.native(function(err, collection) {
					collection.aggregate([{
								$match: {
									matchid: { $in: matchId }
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
								sendResult.forEach(function(matchData) {
									var matchid = matchData._id

									if (rid + "" == matchid + "") {
										matchData.matchplayercount = index['count'];
									}
								});
							});
							countCb();
						});
				});
			}
		], function(err, finalResult) {
			if (err)
				res.badRequest(err);
			else
				res.send({ data: sendResult });
		});
	},

	ListMatchByUser: function(req, res) {
		var id = req.param("id");
		var userdate = req.param("date");
		//console.log("date",moment(userdate, "YYYY-MM-DD HH:mm.Z").toDate());
		id = new ObjectId(id);
		var matchId = [];
		var resultData;
		async.series([
				function(teamCb) {
					Team.native(function(err, collection) {
						if (err)
							return nearByCb({ error: err });

						collection.aggregate([{
								$lookup: {
									from: "match",
									localField: "matchid",
									foreignField: "_id",
									as: "matchdetail"
								}
							},
							{
								$match: {
									// moment(userdate, "YYYY-MM-DD HH:mm.Z").toDate()
									$and: [
										{ 'userid': id },
										{ 'matchdetail.matchtime': { $gte: new Date() } },
										{ 'matchdetail.iscancelmatch': false }
									]
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
									from: "sportcenter",
									localField: "matchdetail.scid",
									foreignField: "_id",
									as: "matchdetail.sportcenterdetail",
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
									teamid: { $first: "$teamid" },
									matchid: { $first: "$matchid" },
									userdetail: { $first: "$userdetail" },
									matchdetail: { $push: "$matchdetail" }
								}
							},

							{
								$project: {
									_id: 1,
									matchid: 1,
									teamid: 1,
									userdetail: 1,
									matchdetail: {
										$filter: { input: "$matchdetail", as: "matchdetail", cond: { $ifNull: ["$$matchdetail._id", false] } }
									}
								}
							}
						], function(err, result) {
							if (err)
								return res.serverError(err);


							result.forEach(function(index) {
								index['matchplayercount'] = 0;
								matchId.push(index.matchdetail[0]._id);
							});
							matchId = _$.uniq(matchId, false);
							matchId = matchId.map(function(obj) { return ObjectId(obj) });

							resultData = result;
							teamCb();
						});
					});
				},
				function(countCb) {
					Team.native(function(err, collection) {
						collection.aggregate([{
									$match: {
										matchid: { $in: matchId }
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
									resultData.forEach(function(invite) {
										var matchid = invite.matchid

										if (rid + "" == matchid + "") {
											invite.matchplayercount = index['count'];
										}
									});
								});
								countCb();
							});
					});
				}
			],
			function(err, finalResult) {
				if (err)
					res.badRequest(err);
				else
					res.send({ data: resultData });
			});
	},
	JoinMatch: function(req, res) {
		var reqData = eval(req.body);
		var isteamid = false;
		var teamResult;
		var actJsn;

		async.series([
			function(teamfindCb) {
				Team.findOne({ $and: [{ matchid: reqData.matchid }, { userid: reqData.userid }] }).exec(function(err, result) {
					if (err)
						return res.serverError(err);

					if (typeof result != "undefined") {
						if (result.teamid == reqData.teamid && result.isbenchplayer == reqData.isbenchplayer)
							isteamid = true;
					}
					teamResult = result;
					teamfindCb();
				});
			},
			function(deleteteamCb) {
				if (isteamid == true || typeof teamResult == "undefined") {
					if (isteamid == true) {
						Match.message(teamResult.matchid, {
							type: 'jointeam'
						});
					}
					deleteteamCb();
					return;
				}
				Team.destroy({ id: teamResult.id }).exec(function(err, result) {
					if (err)
						return res.serverError(err);

					deleteteamCb();
				});
			},
			function(inviteCb) {
				Invitation.find({ $and: [{ matchid: reqData.matchid }, { userid: reqData.userid }] }).exec(function(err, result) {
					if (err)
						return res.serverError(err);

					if (result.length == 0) {
						inviteCb();
						return;
					}

					result[0].accepted = 'yes';
					result[0].save();
					inviteCb();
				});
			},
			function(teamCb) {
				if (isteamid == true) {
					teamCb();
					return;
				}
				Team.create(reqData).exec(function(err, result) {
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
						teamCb({ error: errmsg.join(", ") });
						return;
					}
					if (!result) {
						return teamCb({ error: "Somthing went wrong.Please try again" });
					}

					 actJsn = {
						userid: result.userid,
						onactivityid:result.matchid,
						activitydate: result.createdAt,
						activitytype: "joined match",
						onitem: "match"
					};

					Activity.create(actJsn).exec(function(err, result) {
						if (err)
							return console.log("Activity error==>", err);
					});

					Match.subscribe(req, result.matchid, ['message']);
					Match.message(result.matchid, {
						type: 'jointeam',
						data: result
					});

					teamCb();
				});
			}

		], function(err, finalResult) {
			if (err)
				res.badRequest(err);
			else
				res.send({ message: "You are join the match" });
		});

	},
	SingleMatchTeamDetail: function(req, res) {
		var matchid = req.param("id");
		var matchObj;
		var teamArr = { teamid1: [], teamid2: [] };

		async.series([
			function(matchCb) {
				Match.find({ id: matchid }).populateAll().exec(function(err, matchData) {
					if (err) {
						res.serverError(err);
						return;
					}
					if (matchData.length == 0) {
						matchCb({ error: "This match id not found in our database" });
						return;
					}
					matchObj = matchData;
					matchCb();
				});
			},
			function(teamCb) {
				var matchId = matchObj[0].id;
				Team.find({ matchid: matchId }).populate("userid").exec(function(err, teamResult) {
					if (err) {
						res.serverError(err);
						return;
					}
					if (teamResult.length == 0) {
						teamCb();
						return;
					}
					teamResult.forEach(function(index) {
						if (index.teamid == 1) {
							teamArr.teamid1.push(index);
						} else if (index.teamid == 2) {
							teamArr.teamid2.push(index);
						}
					});

					matchObj[0]['team'] = teamArr;

					teamCb();
				});
			}
		], function(err, finalResult) {
			if (err)
				res.badRequest(err);
			else
				res.send({ data: matchObj });

		});

	},
	LeaveMatch: function(req, res) {
		var userid = req.param("userid");
		var matchid = req.param("matchid");
		var teamDelResult, bplayerResult;
		async.series([
				function(teamCb) {
					Team.destroy({ $and: [{ userid: userid }, { matchid: matchid }] }).exec(function(err, result) {
						if (err) {
							res.serverError(err);
							return;
						}

						if (!result) {
							return res.badRequest({ error: "Somthing went wrong.Please try again" });
						}
						teamDelResult = result;
						var actJsn = {
							userid: result[0].userid,
							onactivityid:result[0].matchid,
							activitydate: new Date(),
							activitytype: "leaved match",
							onitem: "match"
						};

						Activity.create(actJsn).exec(function(err, result) {
							if (err)
								return console.log("Activity error==>", err);
						});

						teamCb();
					});
				},
				function(bplayerCb) {
					if (teamDelResult.length == 0 || teamDelResult[0].isbenchplayer == true) {
						bplayerCb();
						return;
					}
					var matchid = teamDelResult[0].matchid;
					var teamid = teamDelResult[0].teamid;

					Team.findOne({ $and: [{ matchid: matchid }, { teamid: teamid }, { isbenchplayer: true }] }).exec(function(err, result) {
						if (err)
							return res.serverError(err);

						if (typeof result == "undefined") {
							bplayerCb();
							return;
						}

						result.isbenchplayer = false,
							result.save();
						bplayerCb();
					});
				},
				function(msgCb) {
					Match.message(teamDelResult[0].matchid, {
						type: 'leaveteam',
						data: teamDelResult
					});
					msgCb();
				}
			],
			function(err, finalResult) {
				if (err)
					res.badRequest(err);
				else
					res.send({ message: "You are leave the match" });
			});

	},
	ListLastMatchByUser: function(req, res) {
		var id = req.param("id");
		var userdate = req.param("date");

		id = new ObjectId(id);
		var matchId = [];
		var resultData;
		async.series([
				function(teamCb) {
					Team.native(function(err, collection) {
						if (err)
							return nearByCb({ error: err });

						collection.aggregate([{
								$lookup: {
									from: "match",
									localField: "matchid",
									foreignField: "_id",
									as: "matchdetail"
								}
							},
							{
								$match: {
									// moment(userdate, "YYYY-MM-DD HH:mm.Z").toDate()
									$and: [
										{ 'userid': id },
										{
											$or: [
												{ 'matchdetail.matchtime': { $lt: new Date() } },
												{ 'matchdetail.iscancelmatch': true }
											]
										}
									]
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
									from: "sportcenter",
									localField: "matchdetail.scid",
									foreignField: "_id",
									as: "matchdetail.sportcenterdetail",
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
									teamid: { $first: "$teamid" },
									matchid: { $first: "$matchid" },
									userdetail: { $first: "$userdetail" },
									matchdetail: { $push: "$matchdetail" }
								}
							},

							{
								$project: {
									_id: 1,
									matchid: 1,
									teamid: 1,
									userdetail: 1,
									matchdetail: {
										$filter: { input: "$matchdetail", as: "matchdetail", cond: { $ifNull: ["$$matchdetail._id", false] } }
									}
								}
							}
						], function(err, result) {
							if (err)
								return res.serverError(err);

							result.forEach(function(index) {
								index['matchplayercount'] = 0;
								matchId.push(index.matchdetail[0]._id);
							});

							matchId = _$.uniq(matchId, false);
							matchId = matchId.map(function(obj) { return ObjectId(obj) });

							resultData = result;
							teamCb();
						});
					});
				},
				function(countCb) {
					Team.native(function(err, collection) {
						collection.aggregate([{
									$match: {
										matchid: { $in: matchId }
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

								if (result.length == 0)
									return countCb({ error: "Lastmatches not found" });

								result.forEach(function(index) {
									var rid = index['_id']['matchid'];
									resultData.forEach(function(invite) {
										var matchid = invite.matchid

										if (rid + "" == matchid + "") {
											invite.matchplayercount = index['count'];
										}
									});
								});
								countCb();
							});
					});
				}
			],
			function(err, finalResult) {
				if (err)
					res.badRequest(err);
				else
					res.send({ data: resultData });
			});
	},
	MatchUnsubscribe: function(req, res) {
		var id = req.param("id");
		Match.find({ id: id }).populateAll().exec(function(err, matchData) {
			if (err)
				return res.serverError(err);

			if (matchData.length == 0)
				return res.badRequest({ error: "Match not found" });


			Match.unsubscribe(req, matchData, 'id');

			return res.send("ok");
		})
	}

};