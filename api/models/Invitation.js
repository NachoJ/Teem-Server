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
    }
    
}