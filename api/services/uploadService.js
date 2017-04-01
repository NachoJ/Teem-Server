var fs = require("fs");
var request = require("request").defaults({encoding: null});

module.exports = {

    fbProfileImageService: function (uploadfile, oldProfileImage, cb) {

        var folderPath = sails.config.paths.public;

       // console.log('folderPath : ', uploadfile);
        var images = folderPath + '/images';
        var uploadPath = folderPath + '/upload';
        var profilePath = uploadPath + '/profiles';
        var imageName = uploadfile.split('/').pop().replace(/\#(.*?)$/, '').replace(/\?(.*?)$/, '');

        /*if (!fs.existsSync(uploadPath)) {
            fs.mkdir(uploadPath, 0744, function (err) {
                    if (err)
                        console.log("error : ", err);

                    if (!fs.existsSync(profilePath)) {
                        fs.mkdir(profilePath, 0744, function (err) {
                                if (err)
                                    console.log("profile error : ", err);
                                }
                            );
                    }
                });
        }*/

        //Deleting old profile image if exist
        if(oldProfileImage!=""){
            fs.unlink(profilePath + '/' + oldProfileImage, function (err) {
            if (err) 
                console.log(err);
            });
        }

        request(uploadfile)
            .pipe(fs.createWriteStream(profilePath + '/' + imageName))
            .on('close', function () {
                cb({image: imageName});
            });

        /*fs.unlink(profilePath + '/' + oldProfileImage, function (err) {
            if (err) {
                console.log(err);
            } else {}
        });*/
    }
};