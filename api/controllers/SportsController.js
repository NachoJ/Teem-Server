var jsonfile = require('jsonfile');
var sportfile = sails.config.paths.sportFile;
var sportPlayerFile = sails.config.paths.sportPlayerFile;
var ObjectId = require('mongodb').ObjectID;

module.exports = {

    // getSport: function (req, res) {
    //     jsonfile.readFile(sportfile, function (err, result) {
    //         res.send({ data: result });
    //     });

    // },

    // getSportByKey: function (req, res) {
    //     var key = req.param("key");

    //     jsonfile.readFile(sportfile, function (err, result) {

    //         result.forEach(function (index) {
    //             if (index.sportkey == key)
    //                 result = index;
    //         });

    //         res.send({ data: result });
    //     });
    // },

    getSportPlayer: function (req, res) {
        jsonfile.readFile(sportPlayerFile, function (err, result) {
            res.send({ data: result });
        });

    },

    getSportPlayerByKey: function (req, res) {
        var key = req.param("key");

        jsonfile.readFile(sportPlayerFile, function (err, result) {

            result.forEach(function (index) {
                if (index.sport == key)
                    result = index;
            });

            res.send({ data: result });
        });
    },

    CreateSport: function (req, res) {
        //var reqData = eval(req.body);
        var jsonObj = [
            {
                "id": "58fdf7206cbea6e77720f641",
                "title": "Basketball",
                "imageurl": "/assets/img/b02.png"
            },
            {
                "id": "58fdf72b6cbea6e77720f642",
                "title": "Soccer",
                "imageurl": "/assets/img/b01.png"
            },
            {
                "id": "58fdf7316cbea6e77720f643",
                "title": "Padel",
                "imageurl": "/assets/img/b03.png"
            }
        ];
        Sport.create(jsonObj).exec(function (err, result) {
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
                usersCb({ error: errmsg.join(", ") });
                return;
            }

            res.send({ message: "Sport create successfully" });
        })
    },
    CreateSubsport: function (req, res) {
        var reqData = eval(req.body);

        var jsonObj = [
            {
                "id": "58fdf795388094d452525185",
                "sportid": "58fdf7206cbea6e77720f641",
                "title": "3 VS 3",
                "value": 3
            },
            {
                "id": "58fdf79d388094d452525186",
                "sportid": "58fdf7206cbea6e77720f641",
                "title": "5 VS 5",
                "value": 5
            },
            {
                "id": "58fdf7ba388094d452525187",
                "sportid": "58fdf72b6cbea6e77720f642",
                "title": "5 VS 5",
                "value": 5
            },
            {
                "id": "58fdf7c1388094d452525188",
                "sportid": "58fdf72b6cbea6e77720f642",
                "title": "7 VS 7",
                "value": 7
            },
            {
                "id": "58fdf7cb388094d452525189",
                "sportid": "58fdf72b6cbea6e77720f642",
                "title": "11 VS 11",
                "value": 11
            },
            {
                "id": "58fdf7e2388094d45252518a",
                "sportid": "58fdf7316cbea6e77720f643",
                "title": "2 VS 2",
                "value": 2
            }

        ];
        Subsport.create(jsonObj).exec(function (err, result) {
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
                usersCb({ error: errmsg.join(", ") });
                return;
            }

            res.send({ message: "Subsport create successfully" });
        })
    },

    getSport: function (req, res) {

        Sport.find({}).exec(function (err, result) {
            if (err)
                return res.serverError(err);

            if (result.length == 0)
                return res.badRequest({ error: "Sport not found" });

            res.send({ data: result });
        })
    },
    getSubsport: function (req, res) {
           var sportArr = [];
        Subsport.native(function (err, collection) {
            if (err)
                return nearCb({ error: err });

            collection.aggregate([
                {
                    $lookup: {
                        from: "sport",
                        localField: "sportid",
                        foreignField: "_id",
                        as: "sportdetail",
                    }
                },
                {
                    $group:
                    {
                        _id: {
                            id: "$sportdetail._id",
                            title: "$sportdetail.title",
                            imageurl: "$sportdetail.imageurl"
                        },
                        subsport: {
                            $push: {
                                id: "$_id",
                                title: "$title",
                                value: "$value"
                            }
                        }
                    }
                }
            ], function (err, result) {
                if (err)
                    return res.serverError(err);

                if (result.length == 0) {
                    res.badRequest({ error: "Sportlist not found" });
                }

                result.forEach(function (index) {
                    var sport = {
                        id: index._id["id"][0],
                        title: index._id["title"][0],
                        imageurl: index._id["imageurl"][0],
                        subsport: index.subsport
                    }
                    sportArr.push(sport);
                });

                res.send({ data: sportArr });
            });
        });
    },

    getSportByKey: function (req, res) {
        var sportId = req.param("sportid");
        var sportidObj = {};
        if (!sportId)
            return res.badRequest({ error: "Sport id required" });

        if (sportId != "all") {
            sportidObj = { sportid: sportId };
        }
        Subsport.find(sportidObj).exec(function (err, result) {
            if (err)
                return res.serverError(err);

            if (result.length == 0)
                return res.badRequest({ error: "Subsport not found" });

            res.send({ data: result });
        })
    },

    SubsportList: function (req, res) {
        var reqData = eval(req.body);
        var subsportId = reqData.sportid;
        var sportArr = [];
        subsportId = subsportId.split(",");
        subsportId = subsportId.map(function (obj) { return ObjectId(obj) });

        Subsport.native(function (err, collection) {
            if (err)
                return nearCb({ error: err });

            collection.aggregate([
                {
                    $match: {
                        _id: { $in: subsportId }
                    }
                },
                {
                    $lookup: {
                        from: "sport",
                        localField: "sportid",
                        foreignField: "_id",
                        as: "sportdetail",
                    }
                },
                {
                    $group:
                    {
                        _id: {
                            id: "$sportdetail._id",
                            title: "$sportdetail.title",
                            imageurl: "$sportdetail.imageurl"
                        },
                        subsport: {
                            $push: {
                                id: "$_id",
                                title: "$title",
                                value: "$value"
                            }
                        }
                    }
                }
            ], function (err, result) {
                if (err)
                    return res.serverError(err);

                if (result.length == 0) {
                    res.badRequest({ error: "Sportlist not found" });
                }

                result.forEach(function (index) {
                    var sport = {
                        id: index._id["id"][0],
                        title: index._id["title"][0],
                        imageurl: index._id["imageurl"][0],
                        subsport: index.subsport
                    }
                    sportArr.push(sport);
                });

                res.send({ data: sportArr });
            });
        });

    }


};