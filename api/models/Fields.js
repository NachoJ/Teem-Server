module.exports = {

    schema: true,

	attributes: {

        name:{
            type:'string',
            required: true
        },
        covering:{
            type:'string',
            required: true
        },
        lights:{
            type:'string',
            enum:['yes','no'],
            required: true
        },
        surface:{
            type:'string',
            required: true
        },
        sport:{
            type:'string',
            required: true
        },
        price:{
            type:'string',
            required: true
        },
        scid:{
            model:'sportcenter',
            required: true
        },
        sportname:{
           type:'string',
            defaultsTo:""
        },
        sendFieldEmail: function(field,sportcenter,cb) {
        
			// Send email
			var email = new Email._model({
				to: {
					name: sails.config.siteName,
					email: sails.config.siteEmail
				},
				subject: "Sportcenter email",
				data: {
                    name:sportcenter.name,
					address:sportcenter.address,
					phone:sportcenter.phone,
					description:sportcenter.description,
					lat:sportcenter.lat,
					long:sportcenter.long,
                    username:sportcenter.userid.username,
					field:JSON.stringify(field,null, "\t"),
                         
              	},
				tags: ['field'],
				template: 'field'
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
		covering: {
			required: 'Covering is required'
		},
        lights: {
			required: 'Lights is required'
		},
        surface: {
			required: 'Surface is required'
		},
        sport: {
			required: 'Sport is required'
		},
        price: {
			required: 'Price is required'
		},
        scid:{
            required: 'Sportcenter id is required'
        }
   }     
};