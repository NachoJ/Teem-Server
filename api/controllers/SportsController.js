var jsonfile = require('jsonfile');
var sportfile = sails.config.paths.sportFile;
var sportPlayerFile = sails.config.paths.sportPlayerFile;


module.exports = {

    getSport: function (req, res) {
        jsonfile.readFile(sportfile, function (err, result) {
            res.send({ data: result });
        });

    },

    getSportByKey: function (req, res) {
        var key = req.param("key");

        jsonfile.readFile(sportfile, function (err, result) {

            result.forEach(function (index) {
                if (index.sportkey == key)
                    result = index;
            });

            res.send({ data: result });
        });
    },

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
    }


};