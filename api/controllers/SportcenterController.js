module.exports = {

    CreateSportcenter: function (req, res) {
        var reqData = eval(req.body);
        var dataObj;

        if(!reqData.name || !reqData.address || !reqData.phone || !reqData.description)
            return res.badRequest({error :"name or address or phone or description is reqired"});
            
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
                    res.send({data: sportData})
                } else {
                    res.badRequest({error: "Sportcenters not found"})
                }

            });
    },
    SingleSportcenterDisplay: function (req, res) {
        var sportid = req.param("id");

        Sportcenter
            .find({id: sportid})
            .exec(function (err, sportData) {
                if (err) {
                    res.serverError(err);
                    return;
                }
                if (sportData.length == 0) {
                    res.badRequest({error: "This sportcenter id not found in our database"});
                    return;
                }
                res.send({data: sportData});
            });
    },
    DeleteSportcenter: function(req, res) {
        var sportid = req.param("id");
        
        if(!sportid)
            return res.badRequest({error:"Sportcenter id is reqired"});

        Sportcenter
            .destroy({id: sportid})
            .exec(function (err, sportData) {
                if (err) {
                    console.log('err',err);
                    res.serverError(err);
                    return;
                }
                if (sportData.length == 0) {
                    res.badRequest({error: "This sportcenter id not found in our database"});
                    return;
                }
                res.send({message: "Sportcenter delete successfully"});
            });
    },

    UpdateSportcenter: function(req, res) {
        var reqData = eval(req.body);
        var sportid = reqData.id;
        delete reqData.id;

        if(!sportid)
            return res.badRequest({error:"Sportcenter id is reqired"});

        Sportcenter
            .update({id:sportid}, reqData)
            .exec(function afterwards(err, sportData) {
                if (err) {
                    res.serverError(err);
                }
                if (!sportData.length) {
                    return res.badRequest({error: "Sportcenter record not found in our database"});
                }
                res.send({message: "Sportcenter update  successfully"});
            });
    }
};
