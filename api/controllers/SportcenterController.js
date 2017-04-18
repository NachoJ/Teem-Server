module.exports = {

    CreateSportcenter: function (req, res) {
        var reqData = eval(req.body);
        var dataObj;

        if (!reqData.name || !reqData.address || !reqData.phone || !reqData.description)
            return res.badRequest({ error: "name or address or phone or description is reqired" });

        async.series([function (sportCb) {
            Sportcenter
                .create(reqData)
                .exec(function (err, sportData) {
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
                        sportCb({
                            error: errmsg.join(", ")
                        });
                        return;
                    }
                    if (sportData) {
                        dataObj = {
                            "message": "Sportcenter create successfully"
                        }
                        sportCb();
                    }
                });
        }
        ], function (err, finalResult) {
            if (err)
                res.badRequest(err);
            else
                res.send(dataObj);
        }
        );
    },

    ListSportcenter: function (req, res) {
        Sportcenter
            .find()
            .exec(function (err, sportData) {
                if (sportData.length > 0) {
                    res.send({ data: sportData })
                } else {
                    res.badRequest({ error: "Sportcenters not found" })
                }

            });
    },
    SingleSportcenterDisplay: function (req, res) {
        var sportid = req.param("id");

        Sportcenter
            .find({ id: sportid })
            .exec(function (err, sportData) {
                if (err) {
                    res.serverError(err);
                    return;
                }
                if (sportData.length == 0) {
                    res.badRequest({ error: "This sportcenter id not found in our database" });
                    return;
                }
                res.send({ data: sportData });
            });
    },
    DeleteSportcenter: function (req, res) {
        var sportid = req.param("id");

        if (!sportid)
            return res.badRequest({ error: "Sportcenter id is reqired" });

        Sportcenter
            .destroy({ id: sportid })
            .exec(function (err, sportData) {
                if (err) {
                    console.log('err', err);
                    res.serverError(err);
                    return;
                }
                if (sportData.length == 0) {
                    res.badRequest({ error: "This sportcenter id not found in our database" });
                    return;
                }
                res.send({ message: "Sportcenter delete successfully" });
            });
    },

    UpdateSportcenter: function (req, res) {
        var reqData = eval(req.body);
        var sportid = reqData.id;
        var scData;
        var findmatch;
        delete reqData.id;
        console.log("reqData", reqData);
        if (!sportid)
            return res.badRequest({ error: "Sportcenter id is reqired" });

        async.series([
            function (sportUpdate) {
                Sportcenter
                    .update({ id: sportid }, reqData)
                    .exec(function afterwards(err, sportData) {
                        if (err) {
                            return res.serverError(err);
                        }
                        if (!sportData.length) {
                            return sportUpdate({ error: "Sportcenter record not found in our database" });
                        }
                        //res.send({message: "Sportcenter update  successfully"});
                        //console.log("sportData",sportData);
                        scData = sportData;
                        sportUpdate();
                    });
            },
            function(matchfindCb){
                Match.find({ scid: scData[0].id }).exec(function(err,matchResult){
                        if (err) { 
                        return res.serverError(err);
                    }
                    findmatch=matchResult;
                    matchfindCb();
                });
            },
            function (matchCb) {
               // console.log("scData.id",scData[0].id);
               if(findmatch.length==0){
                   console.log("match");
                   matchCb();
                   return;
               }
                var matchData = {
                    coordinates: [parseFloat(scData[0].long), parseFloat(scData[0].lat)]
                };

                Match.update({ scid: scData[0].id }, matchData).exec(function afterwards(err, matchData) {
                    if (err) { 
                        return res.serverError(err);
                    }
                    if (!matchData.length) {
                       return  matchCb({ error: "Match record not found in our database" });
                    }
                    matchCb();

                });
            }
        ], function (err, finalResult) {
            if (err)
                res.badRequest(err);
            else
                res.send({ message: "Sportcenter update  successfully" });
        });

    },

    AutocompleteSearch: function (req, res) {
        var text = req.param("text");

        Sportcenter.find({ $or: [{ name: new RegExp(text, 'i') }, { address: new RegExp(text, 'i') }] })
            .exec(function (err, result) {
                if (err)
                    return res.serverError(err);

                if (result.length == 0)
                    return res.badRequest({ error: 'Sportcenter not exists' });

                res.send(result);
            });
    }
};
