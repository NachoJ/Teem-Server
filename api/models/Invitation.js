module.exports = {
    schema: true,

	attributes: {

		  userid:{
           model:'user',
           required:true
        },
        accepted:{
            type:"string",
            enum:['yes','no'],
            defaultsTo:'no'
        },
        matchid:{
            model:"match",
            required:true
        },
        inviterid:{
            model:'user',
            required:true
        }
    },
    validationMessages: { 
		userid: {
			required: 'User id is required'
		},
        matchid:{
            required: 'Match id is required'
        },
        inviterid:{
            required: 'Inviter id is required'
        }
    },
	afterCreate: function(criteria, next) {
		//console.log("criteria=>", criteria);
		var actJsn = {
			userid: criteria.userid,
			activitydate: criteria.createdAt,
			activitytype: "received",
			onitem: "invitation",
			onactivityid: criteria.id
		};

		Activity.create(actJsn).exec(function(err, result) {
			if (err)
				return console.log("Activity error==>", err);
		});

		next();
	},
	afterUpdate: function(criteria, next) {
		//console.log("criteria=>", criteria);
		var actJsn = {
				userid: criteria.userid,
				onactivityid:criteria.matchid,
				activitydate: criteria.updatedAt,
				activitytype: "accept invitation",
				onitem: "invitation"
		};

		Activity.create(actJsn).exec(function(err, result) {
			if (err)
				return console.log("Activity error==>", err);
		});

		next();
	}
// 	afterDestroy: function(criteria, next) {
// 	console.log("criteria=>", criteria);
// 	var actJsn = {
// 			userid: criteria[0].userid,
// 			activitydate: new Date(),
// 			activitytype: "delete",
// 			onitem: "invitation"
// 		};

// 	Activity.create(actJsn).exec(function(err, result) {
// 		if (err)
// 			return console.log("Activity error==>", err);
// 	});

// 	next();
// },
    
}