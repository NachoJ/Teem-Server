module.exports = {
    schema: true,

    attributes: {

        userid: {
            model:'user',
            required: true
        },
        activitydate: {
           type: 'datetime',
            required: true
        },
		activitytype:{
			type:'string',
			required:true
		},
		onitem:{
			type:'string',
			required:true
		},
		onactivityid:{
			type:'string',
			defaultsTo:""
		}

    },
    validationMessages: { 
		
		userid: {
			required: 'Userid is required'
		},
		activitydate: {
			required: 'Activitydate is required'
		},
		activitytype: {
			required: 'Activitydate is required'
		},
		onitem: {
			required: 'Onitem is required'
		}
	},
}