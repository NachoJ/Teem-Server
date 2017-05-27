module.exports = {

    CreateField: function (req, res) {
        var reqData = eval(req.body);
        var insertOrUpdateData, deleteData;
        var insertArr = [];
        var updateArr = [];
        var subsportArr = [];
	    var dataObj, subsportlist, sportcenterDetail, fieldInsertData;
		var userid=reqData.userid;
        //console.log(reqData,"reqData");
        insertOrUpdateData = reqData.fields;
        deleteData = reqData.deleteids;
	    var subsportid = [];

        if (insertOrUpdateData.length > 0) {
            insertOrUpdateData.forEach(function (index) {
				index['userid']=userid;

                if (!index.id)
                    insertArr.push(index);
                else
                    updateArr.push(index);
            });
        }
        // console.log('insertArr', insertArr);
        //console.log('updateArr', updateArr);
        //return; 
        if (insertArr.length > 0) {
            if (!insertArr[0].name || !insertArr[0].covering || !insertArr[0].lights ||
                !insertArr[0].surface || !insertArr[0].sport || !insertArr[0].price || !insertArr[0].scid)
                return res.badRequest({ error: "name or covering or lights or surface or sport or price or scid is reqired" });
        }

        async.series([

            function (insertCb) {
                if (insertArr.length == 0) {
                    insertCb();
                    return;
                }
                insertArr.forEach(function (index) {
                    var sport = index.sport;
                    //sport = sport.split(",");
                    index.subsport = sport[0];
                    index.sport = sport.join(",");
                    index.sportname = "";
                    subsportid.push(sport[0]);
                });

                Subsport.find({ id: { $in: subsportid } }).populate('sportid').exec(function (err, result) {
                    if (err)
                        return res.serverError(err);

                    subsportlist = result;
                    insertCb();
                });
            },
            function (insertArrCb) {
                if (insertArr.length == 0) {
                    insertArrCb();
                    return;
                }
                insertArr.forEach(function (index) {
                    subsportlist.forEach(function (subindex) {
                        if (index.subsport == subindex.id) {
                            index.sportname = subindex.sportid['title'];
                        }
                    });
                    delete index.subsport;
                });
                // console.log("insertArr", insertArr);
                insertArrCb();
            },
            function (fieldCb) {
                if (insertArr.length == 0) {
                    fieldCb();
                    return;
                }
                // console.log("insertArr1", insertArr);
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
                        dataObj = { "message": "Fields operation successfully" }
                        fieldInsertData = fieldData;
                        fieldCb();
                    }
                });
            },
            function (fieldDeleteCb) {
                if (deleteData.length == 0) {
                    fieldDeleteCb();
                    return;
                }
                Fields.destroy({ id: { $in: deleteData } }).exec(function afterwards(err, fieldData) {
                    if (err) {
                        return res.serverError(err);
                    }
                    dataObj = { "message": "Fields operation successfully" }
                    fieldDeleteCb();
                });
            },
            function (fieldUpdateCb) {
                if (updateArr.length == 0) {
                    fieldUpdateCb();
                    return;
                }
                updateArr.forEach(function (index) {
                    var updateId = index.id;
                    delete index.id;
                    Fields.update({ id: updateId }, index).exec(function afterwards(err, fieldData) {
                        if (err) {
                            return res.serverError(err);
                        }

                    });
                });

                dataObj = { "message": "Fields operation successfully" }
                fieldUpdateCb();
            },
            function (sportcenterCb) {
                Sportcenter.findOneById(reqData.scid).populate('userid').exec(function (err, result) {
                    if (err)
                        return res.serverError(err);

                    dataObj['data'] = result;
                    sportcenterCb();
                });
            },
            function (subsportCb) {
                if (!fieldInsertData) {
                    subsportCb();
                    return;
                }
                Subsport.find({}).populate('sportid').exec(function (err, result) {
                    if (err)
                        return res.serverError(err);

                    result.forEach(function (index) {
                        subsportArr[index.id] = index;
                    });
                    subsportCb();
                });
            },
            function (joinCb) {
                if (!fieldInsertData) {
                    joinCb();
                    return;
                }
                var fieldsText = "";
                fieldInsertData.forEach(function (filed) {
                    var sportTextArr = "";
                    var sportArr = filed.sport;
                    sportArr = sportArr.split(",");

                    sportArr.forEach(function (index) {
                        if (index == subsportArr[index].id) {
                            sportTextArr += subsportArr[index].sportid.title + "(" + subsportArr[index].title + "),";
                        }
                    });

                    if (sportTextArr.charAt(sportTextArr.length - 1) == ',') {
                        sportTextArr = sportTextArr.substr(0, sportTextArr.length - 1);
                    }
                    
                    fieldsText += "<table>";

                    fieldsText += "<tr>";
                    fieldsText += "<td><b>Name</b></td>";
                    fieldsText += "<td><b>:</b></td> <td><span style='color:#01579b;'>" + filed.name + "</span></td>";
                    fieldsText += "</tr>";

                    fieldsText += "<tr>";
                    fieldsText += "<td><b>Covering</b></td>";
                    fieldsText += "<td><b>:</b></td> <td><span style='color:#01579b;'>" + filed.covering + "</span></td>";
                    fieldsText += "</tr>";

                    fieldsText += "<tr>";
                    fieldsText += "<td><b>Light</b></td>";
                    fieldsText += "<td><b>:</b></td> <td><span style='color:#01579b;'>" + filed.lights + "</span></td>";
                    fieldsText += "</tr>";

                    fieldsText += "<tr>";
                    fieldsText += "<td><b>Surface</b></td>";
                    fieldsText += "<td><b>:</b></td> <td><span style='color:#01579b;'>" + filed.surface + "</span></td>";
                    fieldsText += "</tr>";

                    fieldsText += "<tr>";
                    fieldsText += "<td><b>Sports</b></td>";
                    fieldsText += "<td><b>:</b></td> <td><span style='color:#01579b;'>" + sportTextArr + "</span></td>";
                    fieldsText += "</tr>";

                    fieldsText += "<tr>";
                    fieldsText += "<td><b>Price</b></td>";
                    fieldsText += "<td><b>:</b></td> <td><span style='color:#01579b;'>" + filed.price + "</span></td>";
                    fieldsText += "</tr>";

                    fieldsText += "</table>"
                    fieldsText += "<br/>"

                });
                // console.log("fieldsText", fieldsText);

                Jobs.create('sendFieldDetail', { sportcenter: dataObj.data, field: fieldsText, fieldArr: fieldInsertData })
                    .save(function (err, data, msg, token) { });

                joinCb();

            }

        ], function (err, finalResult) {
            if (err)
                res.badRequest(err);
            else
                res.send(dataObj);
        });
    },

    ListField: function (req, res) {
        Fields.find().exec(function (err, filedData) {
            if (filedData.length > 0) {
                res.send({ data: filedData })
            } else {
                res.badRequest({ error: "Fields not found" })
            }

        });
    },
    SingleFieldDisplay: function (req, res) {
        var fieldid = req.param("id");

        Fields.find({ id: fieldid }).exec(function (err, filedData) {
            if (err) {
                res.serverError(err);
                return;
            }
            if (filedData.length == 0) {
                res.badRequest({ error: "This Field id not found in our database" });
                return;
            }

            res.send({ data: filedData });

        });
    },
    DeleteField: function (req, res) {
        var fieldid = req.param("id");

        if (!fieldid)
            return res.badRequest({ message: "Field id is reqired" });

        Fields.destroy({ id: fieldid }).exec(function (err, filedData) {
            if (err) {
                //console.log('err', err);
                res.serverError(err);
                return;
            }
            if (filedData.length == 0) {
                res.badRequest({ error: "This field id not found in our database" });
                return;
            }
            res.send({ message: "Field delete successfully" });
        });
    },

    UpdateField: function (req, res) {
        var reqData = eval(req.body);
        var fieldid = reqData.id;
        delete reqData.id;

        if (!fieldid)
            return res.badRequest({ error: "Field id is reqired" });

        Fields.update({ id: fieldid }, reqData).exec(function afterwards(err, filedData) {
            if (err) {
                res.serverError(err);
            }
            if (!filedData.length) {
                return res.badRequest({ error: "Field record not found in our database" });
            }
            res.send({ message: "Field update  successfully" });
        });
    },
    SportcenterFieldDisplay: function (req, res) {
        var scid = req.param("scid");

        Fields.find({ scid: scid }).exec(function (err, filedData) {
            if (err) {
                res.serverError(err);
                return;
            }
            if (filedData.length == 0) {
                res.badRequest({ error: "This Field id not found in our database" });
                return;
            }

            res.send({ data: filedData });

        });
    },
};
