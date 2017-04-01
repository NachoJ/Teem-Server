module.exports = {
     schema: true,
     attributes: {
         userid:{
           model:'user',
           required:true
        },
        scid:{
            model:'sportcenter',
            required:true
        },
        fieldid:{
            model:'fields',
            required:true
        },
        address:{
            type:'string',
            required:true
        },
        lat:{
            type:'string',
            required:true
        },
        long:{
            type:'string',
            required:true
        },
        sport:{
            type:'string',
            required:true
        },
        benchplayers:{
            type:'integer',
            required:true
        },
        matchtime:{
            type:"datetime",
            required:true
        },
        paymenttype:{
            type:'string',
            enum:['free','online','atthatpitch'],
            required:true
        },
        currency:{
            type:'string',
            defaultsTo:""
        },
        price:{
            type:'string',
            defaultsTo:""
        }
     },
     validationMessages: { 
		userid: {
			required: 'Userid is required'
		},
		scid: {
			required: 'Sportcenter id  is required'
		},
        fieldid: {
			required: 'Fieldid is required'
		},
        address: {
			required: 'Address is required'
		},
        sport: {
			required: 'Sport is required'
		},
        lat: {
			required: 'Lat is required'
		},
        long:{
            required: 'Long  is required'
        },
        benchplayers:{
            required: 'Benchplayers  is required'
        },
        matchtime:{
            required: 'Start date  is required'
        },
        paymenttype:{
            required: 'Paymenttype  is required'
        }
   }     
};