module.exports = {

    CreateField: function (req, res) {
        var reqData = eval(req.body);
        var insertOrUpdateData,deleteData;
        var insertArr = [];
        var updateArr = [];
        var dataObj;

        insertOrUpdateData = reqData.fields;
        deleteData = reqData.deleteids;

        if(insertOrUpdateData.length>0){
            insertOrUpdateData.forEach(function (index) {
                if (!index.id) 
                    insertArr.push(index);
                 else
                    updateArr.push(index);
            });
        }
      // console.log('insertArr', insertArr);
       //console.log('updateArr', updateArr);
       //return;
       if(insertArr.length>0){
         if(!insertArr[0].name || !insertArr[0].covering || !insertArr[0].lights ||
         !insertArr[0].surface || !insertArr[0].sport || !insertArr[0].price || !insertArr[0].scid)     
             return res.badRequest({error:"name or covering or lights or surface or sport or price or scid is reqired"});
       }

        async.series([
            function (fieldCb) {
                if (insertArr.length == 0) {
                    fieldCb();
                    return;
                }
                Fields.create(insertArr).exec(function (err, fieldData) {
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
                            fieldCb({
                                error: errmsg.join(", ")
                            });
                            return;
                        }
                        if (fieldData) {
                            dataObj = {  "message": "Fields operation successfully" }
                            fieldCb();
                        }
                    });
            },
            function (fieldDeleteCb) {
                if (deleteData.length == 0) {
                    fieldDeleteCb();
                    return;
                }
                Fields.destroy({id: {$in: deleteData}}).exec(function afterwards(err, fieldData) {
                        if (err) {
                            return res.serverError(err);
                        }
                        dataObj = {  "message": "Fields operation successfully" }
                        fieldDeleteCb();
                    });
            },
            function (fieldUpdateCb) {
                if (updateArr.length == 0) {
                    fieldUpdateCb();
                    return;
                }
                updateArr.forEach(function(index){
                    var updateId=index.id;
                    delete index.id;   
                    Fields.update({ id: updateId },index).exec(function afterwards(err, fieldData) {
                           if (err) {
                                return res.serverError(err);
                            }
                    });
                });

                dataObj = {  "message": "Fields operation successfully" }
                fieldUpdateCb();
            }
        ],function (err, finalResult) {
            if (err) 
                res.badRequest(err);
            else 
                res.send(dataObj);
            });
    },

    ListField: function (req, res) {
        Fields.find().exec(function (err, filedData) {
                if (filedData.length > 0) {
                    res.send({data: filedData})
                } else {
                    res.badRequest({error: "Fields not found"})
                }

            });
    },
    SingleFieldDisplay: function (req, res) {
        var fieldid = req.param("id");

        Fields.find({id: fieldid}).exec(function (err, filedData) {
                if (err) {
                    res.serverError(err);
                    return;
                }
                if (filedData.length == 0) {
                    res.badRequest({error: "This Field id not found in our database"});
                    return;
                }

                res.send({data: filedData});

            });
    },
    DeleteField: function(req, res) {
        var fieldid = req.param("id");

        if (!fieldid) 
            return res.badRequest({message: "Field id is reqired"});
        
        Fields.destroy({id: fieldid}).exec(function (err, filedData) {
                if (err) {
                    console.log('err', err);
                    res.serverError(err);
                    return;
                }
                if (filedData.length == 0) {
                    res.badRequest({error: "This field id not found in our database"});
                    return;
                }
                res.send({message: "Field delete successfully"});
            });
    },

    UpdateField: function(req, res) {
        var reqData = eval(req.body);
        var fieldid = reqData.id;
        delete reqData.id;

        if (!fieldid) 
            return res.badRequest({error: "Field id is reqired"});
        
        Fields.update({id: fieldid}, reqData).exec(function afterwards(err, filedData) {
                if (err) {
                    res.serverError(err);
                }
                if (!filedData.length) {
                    return res.badRequest({error: "Field record not found in our database"});
                }
                res.send({message: "Field update  successfully"});
            });
    }
};