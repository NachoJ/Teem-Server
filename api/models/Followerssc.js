module.exports = {
	schema: true,
	attributes: {
		userid: {
			model: 'user',
			required: true
		},
		scid: {
			model: 'sportcenter',
			required: true
		}
	},
	validationMessages: {
		userid: {
			required: 'Userid is required'
		},
		scid: {
			required: 'Sportcenter id is required'
		}
	}
};