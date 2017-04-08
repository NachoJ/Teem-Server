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
            type:'boolean',
            enum:[true,false],
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