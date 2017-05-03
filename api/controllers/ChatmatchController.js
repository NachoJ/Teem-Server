module.exports = {

    CreateChatMatch: function (req, res) {
        var reqData = eval(req.body);
        var userData;
        async.series([
            function (userCb) {
                User.findOneById(reqData.fromuserid).exec(function (err, result) {
                    if (err)
                        return res.serverError(err);

                    var DataObj = {
                        username: result.username,
                        firstname: result.firstname,
                        lastname: result.lastname,
                        id: result.id,
                        profileimage: result.profileimage
                    };

                    userData = DataObj;
                    userCb();
                });
            },
            function (chatCb) {
                Chat_Match.create(reqData).exec(function (err, result) {
                    if (err) {
                        var errmsg = [];
                        if (err.Errors) {
                            var arrErrors = err.Errors;
                            for (var k in arrErrors) {
                                if (arrErrors.hasOwnProperty(k)) {
                                    errmsg.push(arrErrors[k][0].message);
                                }
                            }
                            res.badRequest({ error: errmsg.join(", ") });
                            return;
                        }
                    }

                    if (typeof result == "undefined") {
                        res.badRequest({ error: "Chat not create" });
                        return;
                    }

                    result.fromuserid = userData;

                    Match.message(result.matchid, {
                        type: "chatmatch",
                        data: result
                    });

                    chatCb();
                });
            }
        ],
            function (err, finalResult) {
                if (err)
                    return res.badRequest(err);
                else
                    res.send("ok");
            });

    },

    getChatMatch: function (req, res) {
        var matchid = req.param("id");
        if (!matchid)
            return res.badRequest({ error: "Match id is required" });

        Chat_Match.find({ matchid: matchid }).populate("fromuserid").exec(function (err, result) {
            if (err)
                return res.serverError(err);

            if (result.length == 0)
                return res.badRequest({ error: "No any chat found" });

            res.send({ data: result });
        });

    }

}; 