var jsonfile = require('jsonfile');
var currencyfile=sails.config.paths.currencyFile;
var fs = require("fs");

module.exports = {

    getCurrency:function(req,res){
        jsonfile.readFile(currencyfile,function(err, result) {
                res.send({data:result});
        });
        
    },
    
    getCurrencyByKey:function(req,res){
        var key=req.param("key");

        jsonfile.readFile(currencyfile,function(err, result) {
                
                result.forEach(function(index){
                    if(index.currencykey==key)
                        result=index;
                });

                res.send({data:result});
        });
    }

};