module.exports = {
	schema: true,
	attributes: {
		userid: {
			model: 'user',
			required: true
		},
		followinguserid: {
			model: 'user',
			required: true
		}
	},
	validationMessages: {
		userid: {
			required: 'Userid is required'
		},
		followinguserid: {
			required: 'Followinguserid is required'
		}
	}
};