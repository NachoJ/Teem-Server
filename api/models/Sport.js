module.exports = {
    schema: true,

    attributes: {

        title: {
            type:'string',
            required: true
        },
        imageurl: {
            type:'string',
            required: true
        }
    },
    validationMessages: { 
		title: {
			required: 'Title is required'
		},
		imageurl: {
			required: 'Imageurl is required'
		}
	},
}