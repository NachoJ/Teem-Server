module.exports = {
    schema: true,

    attributes: {

        matchid: {
            model: "match",
            required: true
        },
        fromuserid: {
            model: 'user',
            required: true
        },
        message:{
            type:'text',
            required: true
        }
    },
    validationMessages: { 
		userid: {
			required: 'User id is required'
		},
		matchid: {
			required: 'Match id is required'
		},
		message: {
			required: 'Message is required'
		}
        
	},
}