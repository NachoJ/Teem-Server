
module.exports = {

    schema: true,

	attributes: {

        name:{
            type:'string',
            required: true
        },
        address:{
            type:'string',
            required: true
        },
        phone:{
            type:'string',
            required: true
        },
        description:{
            type:'string',
            required: true
        },
        lat:{
            type:'float',
            required:true
        },
        long:{
            type:'float',
            required:true
        },
        userid:{
            model:"user",
            required:true
        },
		ispublic:{
			type:'boolean',
			defaultsTo:false
		},
		isreviewed:{
			type:'boolean',
			defaultsTo:false
		},
        sendSportcenterEmail: function(user,cb) {
            console.log("mail",user);
			var self = this;

			// Send email
			var email = new Email._model({
				to: {
					name: sails.config.siteName,
					email: sails.config.siteEmail
				},
				subject: "Sportcenter email",
				data: {
					name:self.name,
					address:self.address,
					phone:self.phone,
					description:self.description,
					lat:self.lat,
					long:self.long,
                    username:user.username

				},
				tags: ['sportcenter'],
				template: 'sportcenter'
			});

			email.setDefaults();

			email.send(function(err, res, msg) {
				cb(err, res, msg, "token");
			});
			// });
		}     
    },
    validationMessages: { 
		name: {
			required: 'Name is required'
		},
		address: {
			required: 'Address is required'
		},
        phone: {
			required: 'Phone is required'
		},
        description: {
			required: 'Description is required'
		},
        lat: {
			required: 'Lat is required'
		},
        long:{
            required: 'Long  is required'
        },
        userid:{
            required: 'Userid  is required'
        }
	}
      
};