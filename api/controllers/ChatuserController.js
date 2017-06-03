var ObjectId = require('mongodb').ObjectID;
var _$ = require("lodash");

module.exports = {

	unreadMessageCount: function(req, res) {
		var userids = req.param("userid");
		userid = new ObjectId(userids);

		var userResult;
		var userData = [];
		var userId = [];
		var chatArr=[];
		var chatData;

		async.series([
				function(countCb) {
					Chat_User.native(function(err, collection) {
						collection.aggregate([{
									$match: {
										$and: [{ isread: false },
											{ receiveruserid: userid }
										]
									}
								},
								{
									$group: {
										_id: {
											userid: "$senderuserid"
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
									var id = index._id.userid;
									userData[id] = index.count;
								});

								countCb();
							});
					});
				},
				function(idCb) {
					Chat_User.find({ receiveruserid: userids }).exec(function(err, result) {
						if (err)
							return res.serverError(err);

						result.forEach(function(index) {
							var id = index.senderuserid;
							userId.push(id);
						});
						userId = _$.uniq(userId, false);

						//console.log("chatData",chatData);
						idCb();

					});
				},
				function(chatCb){
					Chat_User.find({ $or: [{ senderuserid: userids }, { receiveruserid: userids }] }).exec(function(err, result) {
						if (err)
							return res.serverError(err);

						//console.log("result",result);	
						// result.forEach(function(index){
						// 	chatArr[index.senderuserid]=index;

						// });

						chatData=result;

						chatCb();

					});
				},
				function(userCb) {
					//console.log("userData1", userData);
					User.find({ id: { $in: userId } }).exec(function(err, result) {
						if (err)
							return res.serverError(err);

						result.forEach(function(index) {
							index['count'] = 0;
							var chat=[];
							if (userData[index.id])
								index['count'] = userData[index.id];

							chatData.forEach(function(indexchat){
								//console.log("index",index);
								if(indexchat.senderuserid==index.id || indexchat.receiveruserid==index.id){
									//console.log("insert");
									chat.push(indexchat);
								}
							});
									
									index['chatdata']=chat;
						});

						userResult = result;
						userCb();
					});
				}
			],
			function(err, finalResult) {
				if (err)
					res.badRequest(err);
				else
					res.send({ data: userResult });
			}
		);

	},

	privateMessageDisplay: function(req, res) {
		var userid = req.param("userid");
		var profileid = req.param("profileid");
		var chatData;
		console.log("userid",userid);
		console.log("profileid",profileid);
		
		async.series([
				function(seenCb) {
					Chat_User.update({ receiveruserid: userid, senderuserid: profileid }, { isread: true }).exec(function(err, result) {
						if (err)
							return res.serverError(err);

						console.log("result update",result);
						seenCb();
					});
				},
				function(chatCb) {
					Chat_User.find({ $and: [{ $or: [{ senderuserid: userid }, { receiveruserid: userid }] }, { $or: [{ senderuserid: profileid }, { receiveruserid: profileid }] }] }).exec(function(err, result) {
						if (err)
							return res.serverError(err);

						if (result.length == 0) {
							return chatCb({ error: "No any message found" });
						}

						chatData = result;
						chatCb();
					});
				}
			],
			function(err, finalResult) {
				if (err)
					res.badRequest(err);
				else
					res.send({ data: chatData });
			}
		);
	},

	privateMessageCreate: function(req, res) {
		var reqData = eval(req.body);
		var userChat;
		//console.log("reqData", reqData);
		async.series([
				function(chatCb) {
					Chat_User.create(reqData).exec(function(err, result) {
						if (err) {
							var errmsg = [];
							if (err.Errors) {
								var arrErrors = err.Errors;
								for (var k in arrErrors) {
									if (arrErrors.hasOwnProperty(k)) {
										errmsg.push(arrErrors[k][0].message);
									}
								}
								chatCb({ error: errmsg.join(", ") });
								return;
							}
						}
						if (!result)
							return chatCb({ error: "message not create" });

						userChat = result;
						chatCb();

					});
				},
				function(userCb) {
					User.findOneById(reqData.receiveruserid).exec(function(err, result) {
						if (err)
							return res.serverError(err);

						if (typeof result == "undefined")
							return userCb({ error: "user not found" });

						var DataObj = {
							username: result.username,
							firstname: result.firstname,
							lastname: result.lastname,
							id: result.id,
							profileimage: result.profileimage
						};

						//userChat.receiveruserid = DataObj;

						// sender message create
						User.message(userChat.senderuserid, {
							from: userChat.senderuserid,
							msg: userChat,
							senttouser: userChat.receiveruserid
						});

						// received user message	
						User.message(userChat.receiveruserid, {
							from: userChat.senderuserid,
							msg: userChat,
							senttouser: ""
						});

						userCb();
					});
				}
			],
			function(err, finalResult) {
				if (err)
					res.badRequest(err);
				else
					res.ok();
			});
	},

	userTypingMessage: function(req, res) {
		var userid = req.param("userid");
		var senderid = req.param("senderid");

		User.findOneById(senderid).exec(function(err, result) {
			if (err) {
				res.serverError(err);
				return;
			}
			if (typeof sender == "undefined")
				return res.badRequest({ error: "User not found" });

			User.message(userid, {
				from: result,
				usertyping: true
			});

			res.ok();
		});

	},

	readPrivateUserMessage: function(req, res) {
		var userid = req.param("userid");

		Chat_User.update({ receiveruserid: userid }, { isseen: true, isread: true }).exec(function(err, result) {
			if (err)
				return res.serverError(err);

			res.ok();
		});
	}

};