module.exports = {

    CreateEmail: function (req, res) {
        var reqData = eval(req.body);
        var userData;
        console.log("reqData", reqData);
        async.series([
            function (checkEmailCb) {
                User.findOneByEmail(reqData.email).exec(function (err, result) {
                    if (err)
                        return res.serverError(err);

                    if (typeof result != "undefined") {
                        return checkEmailCb({ error: "Email alreay exsist" });
                    }
                    checkEmailCb();
                });
            },
            function (checkUserCb) {
                User.findOneById(reqData.userid).exec(function (err, result) {
                    if (err)
                        return res.serverError(err);

                    if (typeof result != "undefined")
                        userData = result;
                    else
                        return checkUserCb({ error: "User not found" });

                    checkUserCb();

                });
            },
            function (createEmailCb) {
                Emailchange.create(reqData).exec(function (err, result) {
                    if (err)
                        return res.serverError(err);

                    result.sendChangeActivationEmail(userData.username, function (err, data, msg, token) {
                        if (err)
                            return res.serverError(err);
                    });
                    createEmailCb();
                });
            }
        ],
            function (err, finalResult) {
                if (err)
                    res.badRequest(err);
                else
                    res.send({ message: "Please check your email and change your email " });
            });
    },
    UpdateEmail: function (req, res, next) {
        var activationlink = req.param("activationlink");
        console.log('activationlink', activationlink);

        if (!activationlink)
            return res.badRequest({ error: "Required activation key" });

        var emailData, userData;
        async.series([
            function (checkEmailCb) {
                Emailchange.findOneByActivationlink(activationlink, function (err, email) {
                    if (err)
                        return res.serverError(err);

                    if (!email)
                        return res.badRequest({ error: "Email with activation link not found" });

                    emailData = email;
                    checkEmailCb();
                });
            },
            function (userCb) {

                User.findOneById(emailData.userid, function (err, user) {
                    if (err)
                        return res.serverError(err);

                    if (!user)
                        return res.badRequest({ error: "User not found" });


                    userCb();

                });
            },
            function (userUpdateCb) {
                User.update({ id: emailData.userid }, { email: emailData.email }).exec(function (err, result) {
                    if (err)
                        return res.serverError(err);

                    if (result)
                        userData = result[0];

                    userUpdateCb();

                });
            },
            function (emaildeleteCb) {
                Emailchange.destroy({ id: emailData.id }).exec(function (err, result) {
                    if (err)
                        return res.serverError(err);

                    if (!result)
                        return emaildeleteCb({ error: "Email not updated" });

                    emaildeleteCb();
                });
            }
        ],
            function (err, finalResult) {
                if (err)
                    res.badRequest(err);
                else
                    res.send({ data: { message: "Your email is update successfully ", data: userData } });
            });
    }
};