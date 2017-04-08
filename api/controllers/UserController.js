var moment = require('moment');
var fs = require("fs");

module.exports = {

    ProfileUpdate: function (req, res) {
        var reqData = eval(req.body);
		
        var userid = reqData.userid;
        delete reqData.userid;
		
        reqData.dob = moment(new Date(reqData.dob)).toISOString();

        User.update({ id: userid }, reqData).exec(function afterwards(err, userData) {
            if (err) {
                res.serverError(err);
            }
            if (!userData.length) {
                return res.badRequest({ error: "User record not found in our database" });
            }
            res.send({ data: { data: userData[0], message: "User update successfully" } });
        });
    },

    profileImageUpload: function (req, res) {

        var userid =req.param("userid");
        console.log('reqData',userid);
		var reqData={};
		
        var folderPath = sails.config.paths.public;
        var imagePath = folderPath + '/upload/profiles';
       console.log('profile : ',req.file('profile'));
        var origifilename = req.file('profile')._files[0].stream.filename;
        
        var newfilename = moment().utc().unix() + "_" + origifilename;

        User.findOneById(userid).exec(function (err, result) {
            if (err)
                return res.serverError(err);

            if (typeof result == "undefined")
                return res.badRequest({ error: "User not found" });

            req.file('profile').upload({
                saveAs: newfilename,
                dirname: imagePath
            },function whenDone(err, uploadedFiles) {
                if (err) {
                    return res.negotiate(err);
                }

                if (uploadedFiles.length === 0) {
                    return res.badRequest('No file was uploaded');
                }

                reqData['profileimage'] = newfilename;
              
                 if(result.profileimage!=""){
                        fs.unlink(imagePath + '/' + result.profileimage, function (err) {
                        if (err) 
                            console.log(err);
                        });
                }

                User.update({ id: userid }, reqData).exec(function afterwards(err, userData) {
                    if (err) {
                        res.serverError(err);
                    }
                    if (!userData.length) {
                        return res.badRequest({ error: "User record not found in our database" });
                    }
                    res.send({ data: { data: userData[0], message: "User update successfully" } });
                });
            });
        });
    }

};
