/**
 * Kue job queue holder
 *
 * Queue will be loaded into this object in bootstrap.js
 */
module.exports = {
    _processors: {

    
        sendInvitation:function(job,cb){
            if(!job.data.user)
                return cb(new Error("User detail not provided"));

            if(!job.data.inviter)
                return cb(new Error("Invier detail not provided"));    

            if(!job.data.invitationid)
                return cb(new Error("Invitationid not provided"));    

             var user=new  User._model(job.data.user);
             var inviter=new  User._model(job.data.inviter);

             var invitationid=job.data.invitationid;
             
             user.sendInvitationEmail(user,inviter,invitationid,function(err,res,data,token){
                    if(res){
                        cb(err,res,data);
                    }
             });
        },
        sendSportcenterDetail:function(job,cb){
            if(!job.data.sportcenter)
                return cb(new Error("Sportcenter detail not provided"));

            if(!job.data.user)
                return cb(new Error("User detail not provided"));
               
            var sportcenters=new Sportcenter._model(job.data.sportcenter);
            var user=job.data.user;

            sportcenters.sendSportcenterEmail(user,function(err,res,data){
                    if(res){
                        cb(err,res,data);
                    }
            });
        },
        sendFieldDetail:function(job,cb){
            if(!job.data.sportcenter)
                return cb(new Error("Sportcenter detail not provided"));

            if(!job.data.field)
                return cb(new Error("Field detail not provided"));

            if(!job.data.fieldArr)
                return cb(new Error("FieldArr  not provided"));    

            var field=job.data.field;
            var fieldArr=new Fields._model(job.data.fieldArr);
            var sportcenter=job.data.sportcenter;

             fieldArr.sendFieldEmail(field,sportcenter,function(err,res,data){
                    if(res){
                        cb(err,res,data);
                    }
            });
                
        }
    }

}
