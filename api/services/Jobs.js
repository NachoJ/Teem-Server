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

             var user=new  User._model(job.data.user);
             var inviter=new  User._model(job.data.inviter);
             
             user.sendInvitationEmail(user,inviter,function(err,res,data,token){
                    if(res){
                        cb(err,res,data);
                    }
             });
        }
    }

}
