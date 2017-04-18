var _ = require("lodash");
var ObjectId = require('mongodb').ObjectID;
module.exports = {

    CreateMatch: function (req, res) {
        var reqData = eval(req.body);
        var dataObj;
        var sportDetail, fieldDetail;

        async.series([
            function (scCb) {
                Sportcenter.findOneById(reqData.scid).exec(function (err, scData) {
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
            function (fieldCb) {
                Fields.findOneById(reqData.fieldid).exec(function (err, fieldData) {
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
            function (matchCb) {
                reqData.coordinates = [parseFloat(sportDetail.long), parseFloat(sportDetail.lat)];
                reqData.sport = fieldDetail.sport;
                reqData.matchtime = new Date(reqData.matchtime).toISOString();

                Match.create(reqData).exec(function (err, matchData) {
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

                    matchCb();
                });
            },
            function (teamCb) {
                var teamObj = {
                    matchid: dataObj.id,
                    userid: dataObj.userid,
                    teamid: 1
                };

                Team.create(teamObj).exec(function (err, result) {
                    if (err)
                        return res.serverError(err);

                    if (!result)
                        return teamCb({ error: "Team not create.Please try again" });

                    teamCb();
                });
            }
        ],
            function (err, finalResult) {
                if (err)
                    res.badRequest(err);
                else
                    res.send({ data: { message: "Match create successfully", data: dataObj } });
            })

    },

    ListMatch: function (req, res) {
        Match.find().populateAll().exec(function (err, filedData) {
            if (filedData.length > 0) {
                res.send({ data: filedData })
            } else {
                res.badRequest({ error: "Matches not found" })
            }

        });
    },

    SingleMatchDisplay: function (req, res) {
        var matchid = req.param("id");
        var matchObj;
        var teamArr = { teamid1: [], teamid2: [] };
        async.series([
            function (matchCb) {
                Match.find({ id: matchid }).populateAll().exec(function (err, matchData) {
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
            function (teamCb) {
                var matchId = matchObj[0].id;
                Team.find({ matchid: matchId }).populate("userid").exec(function (err, teamResult) {
                    if (err) {
                        res.serverError(err);
                        return;
                    }
                    if (teamResult.length == 0) {
                        teamCb();
                        return;
                    }
                    teamResult.forEach(function (index) {
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
        ], function (err, finalResult) {
            if (err)
                res.badRequest(err);
            else
                res.send({ data: matchObj })
        });

    },

    DeleteMatch: function (req, res) {
        var matchid = req.param("id");

        if (!matchid)
            return res.badRequest({ message: "Match id is reqired" });

        Match.destroy({ id: matchid }).exec(function (err, matchData) {
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

    UpdateMatch: function (req, res) {
        var reqData = eval(req.body);
        var matchid = reqData.id;
        delete reqData.id;
        var sportDetail, fieldDetail;

        if (!matchid)
            return res.badRequest({ error: "Match id is reqired" });

        async.series([
            function (scCb) {
                if (!reqData.scid) {
                    scCb();
                    return;
                }
                Sportcenter.findOneById(reqData.scid).exec(function (err, scData) {
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
            function (fieldCb) {
                if (!reqData.fieldid) {
                    fieldCb();
                    return;
                }
                Fields.findOneById(reqData.fieldid).exec(function (err, fieldData) {
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
            function (matchCb) {
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
            function (err, finalResult) {
                if (err)
                    res.badRequest(err);
                else
                    res.send({ message: "Match update successfully" });
            });
    },
    FindNearByMatch: function (req, res) {
        var reqData = eval(req.body);
        var sendResult;
        var sport = reqData.sport;
        var conditions = {
            long: parseFloat(reqData.long) || 0,
            lat: parseFloat(reqData.lat) || 0,
            maxDistance: parseFloat(reqData.maxdistance) || 1500,
        };

        async.series([
            function (nearCb) {
                if (sport == "all") {
                    nearCb();
                    return;
                }
                Match.native(function (err, collection) {
                    if (err)
                        return nearCb({ error: err });

                    collection.aggregate([
                        {
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
                                $and: [{ 'sport': sport }]
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
                                },
                                sportcenterdetail: 1
                            }
                        }

                    ], function (err, result) {
                        if (err)
                            return nearCb({ error: err });

                        sendResult = result
                        nearCb();
                    });
                });
            },
            function (nearByCb) {
                if (sport != "all") {
                    nearByCb();
                    return;
                }
                Match.native(function (err, collection) {
                    if (err)
                        return nearByCb({ error: err });

                    collection.aggregate([
                        {
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
                                },
                                sportcenterdetail: 1
                            }
                        }
                    ], function (err, result) {
                        if (err)
                            return nearByCb({ error: err });

                        sendResult = result
                        nearByCb();
                    });
                });
            }
        ], function (err, finalResult) {
            if (err)
                res.badRequest(err);
            else
                res.send({ data: sendResult });
        });
    },

    ListMatchByUser: function (req, res) {
        var id = req.param("id");
        id = new ObjectId(id);
        var matchId = [];
        var resultData;
        async.series([
            function (teamCb) {
                Team.native(function (err, collection) {
                    if (err)
                        return nearByCb({ error: err });

                    collection.aggregate([
                        {
                            $match: {
                                $and: [{ 'userid': id }]
                            }
                        }, {
                            $lookup: {
                                from: "match",
                                localField: "matchid",
                                foreignField: "_id",
                                as: "matchdetail"
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
                    ], function (err, result) {
                        if (err)
                            return res.serverError(err);

                        result.forEach(function (index) {
                            index['matchplayercount'] = 0;
                            matchId.push(index.matchdetail[0]._id);
                        });
                        matchId = _.uniq(matchId, false);
                        matchId = matchId.map(function (obj) { return ObjectId(obj) });

                        resultData = result;
                        teamCb();
                    });
                });
            },
            function (countCb) {
                Team.native(function (err, collection) {
                    collection.aggregate([
                        {
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
                        function (err, result) {
                            if (err)
                                return res.serverError(err);

                            result.forEach(function (index) {
                                var rid = index['_id']['matchid'];
                                resultData.forEach(function (invite) {
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
            function (err, finalResult) {
                if (err)
                    res.badRequest(err);
                else
                    res.send({ data: resultData });
            });
    },
    JoinMatch: function (req, res) {
        var reqData = eval(req.body);

        Team.create(reqData).exec(function (err, result) {
            if (err) {
                console.log("err", err);
                var errmsg = [];
                if (err.Errors) {
                    var arrErrors = err.Errors;
                    for (var k in arrErrors) {
                        if (arrErrors.hasOwnProperty(k)) {
                            errmsg.push(arrErrors[k][0].message);
                        }
                    }
                }
                res.badRequest({ error: errmsg.join(", ") });
                return;
            }
            if(!result){
                return res.badRequest({error:"Somthing went wrong.Please try again"});
            }
            res.send({message:"You are join the match"});

        });
    },

    LeaveMatch: function (req, res) {
        var userid =req.param("userid");
        var matchid=req.param("matchid");

        Team.destroy({$and:[{userid:userid},{matchid:matchid}]}).exec(function (err, result) {
            if (err) {
                res.serverError(err);
                return;
            }
            
            if(!result){
                return res.badRequest({error:"Somthing went wrong.Please try again"});
            }

            res.send({message:"You are leave the match"});

        });
    }

};