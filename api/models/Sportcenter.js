
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
        }
	}    
};