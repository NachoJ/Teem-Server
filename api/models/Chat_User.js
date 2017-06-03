module.exports = {
    schema: true,

    attributes: {

        senderuserid: {
            model: "user",
            required: true
        },
        receiveruserid: {
            model: 'user',
            required: true
        },
        message:{
            type:'text',
            required: true
        },
		isseen:{
			type:'boolean',
			defaultsTo:false
		},
		isread:{
			type:'boolean',
			defaultsTo:false
		}
    },
    validationMessages: { 
		senderuserid: {
			required: 'Senderuserid is required'
		},
		receiveruserid: {
			required: 'Receiveruserid is required'
		},
		message: {
			required: 'Message is required'
		}
        
	},
}