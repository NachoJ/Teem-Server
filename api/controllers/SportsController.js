var jsonfile = require('jsonfile');
var sportfile=sails.config.paths.sportFile;
var fs = require("fs");

module.exports = {

    getSport:function(req,res){
        jsonfile.readFile(sportfile,function(err, result) {
                res.send({data:result});
        });
        
    },
    
    getSportByKey:function(req,res){
        var key=req.param("key");

        jsonfile.readFile(sportfile,function(err, result) {
                
                result.forEach(function(index){
                    if(index.sportkey==key)
                        result=index;
                });

                res.send({data:result});
        });
    }

};