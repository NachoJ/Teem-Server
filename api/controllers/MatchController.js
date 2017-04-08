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
                //reqData.lat=sportDetail.lat;
                reqData.coordinates = [parseFloat(sportDetail.long), parseFloat(sportDetail.lat)];
                reqData.sport = fieldDetail.sport;
                reqData.matchtime = new Date(reqData.matchtime).toISOString();

                Match.create(reqData).exec(function (err, matchData) {
                    if (err) {
                        console.log('err', err);
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
                        matchCb({ error: "Metch not create.Please try again" });
                    }
                    matchCb();
                });
            }
        ],
            function (err, finalResult) {
                if (err)
                    res.badRequest(err);
                else
                    res.send({ message: "Match create successfully" });
            })

    },

    ListMatch: function (req, res) {
        Match.find().exec(function (err, filedData) {
            if (filedData.length > 0) {
                res.send({ data: filedData })
            } else {
                res.badRequest({ error: "Matches not found" })
            }

        });
    },

    SingleMatchDisplay: function (req, res) {
        var matchid = req.param("id");

        Match.find({ id: matchid }).exec(function (err, matchData) {
            if (err) {
                res.serverError(err);
                return;
            }
            if (matchData.length == 0) {
                res.badRequest({ error: "This match id not found in our database" });
                return;
            }
            res.send({ data: matchData });
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
                    //reqData.lat=sportDetail.lat;
                    //reqData.long=sportDetail.long;
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
        var sport=reqData.sport;
        var conditions = {
                long: parseFloat(reqData.long) || 0,
                lat: parseFloat(reqData.lat) || 0,
                maxDistance: parseFloat(reqData.maxdistance) || 1000,
            };

        async.series([
            function (nearCb) {
                if(sport=="all"){
                    nearCb();
                    return;
                }
                Match.native(function (err, collection) {
                            if (err) 
                                return nearCb({error:err});

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
                            $match:{
                                $and:[{'sport':sport}]
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
                            $project:{
                                _id:1,
                                userid:1,
                                scid:1,
                                fieldid:1,
                                benchplayers:1,
                                matchtime:1,
                                paymenttype:1,
                                currency:1,
                                price:1,
                                coordinates:1,
                                sport:1,
                                address:1,
                                distance:1,
                                username:"$userdetail.username"
                            }
                        }
                        ], function (err, result) {
                                if (err)
                                return nearCb({error:err});

                                sendResult=result
                                nearCb();
                        });
                 });         
            },
            function (nearByCb) {
                if(sport!="all"){
                    nearByCb();
                    return;
                }
                Match.native(function (err, collection) {
                            if (err) 
                                return nearByCb({error:err});

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
                        }
                        ], function (err, result) {
                                if (err)
                                return nearByCb({error:err});

                                sendResult=result
                                nearByCb();
                        });
                 });         
            }
            ],function(err, finalResult) {
                if (err)
                    res.badRequest(err);
                else
                    res.send({data:sendResult});
             });
    }

};