module.exports = {
    schema: true,

    attributes: {

        sportid: {
            model:'sport',
            required: true
        },
        title: {
            type:'string',
            required: true
        },
        value:{
            type:'integer',
            required: true
        }
    },
    validationMessages: { 
        sportid:{
            required: 'Sport id is required'
        },
		title: {
			required: 'Title is required'
		},
		value: {
			required: 'Value is required'
		}
	},
}