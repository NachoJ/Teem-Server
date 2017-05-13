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
            defaultsTo:""
        },
        coordinates: {
            type: "json",
            required:true
        },
        sport:{
           model:"sport",
            required:true
        },
        subsportid:{
            model:"subsport",
            required:true,
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
            enum:['free','online','atthepitch'],
            required:true
        },
        currency:{
            type:'string',
            defaultsTo:""
        },
        price:{
            type:'string',
            defaultsTo:""
        },
        isprematch:{
            type:'boolean',
            defaultsTo:false
        },
        
        iscancelmatch:{
            type:'boolean',
            defaultsTo:false
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
        sport: {
			required: 'Sport id is required'
		},
        subsportid:{
            required: 'Subsport id is required'
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
   },
    beforeDestroy: function (criteria, next){
        // Viewfoo.findOneById(criteria.where.id).exec(function (err, viewfooData) {
        //     ContainerImage.destroy({viewfooid: criteria.where.id}).exec(function (err, imgdata) {
        //         if (err) {
        //             next("not found");
        //         }
        //         var file=viewfooData.userid + '/' + viewfooData.id + '/';
        //         fileuploadService.deleteFiles(file, function (filename, log) {
        //             if (filename.status == false) {
        //             }
        //         });
        //         //console.log("containermimg", imgdata);
        //         Container.destroy({viewfooid: criteria.where.id}).exec(function (err, container) {
        //         if (err) {
        //             next("not found");
        //         }
        //         //console.log("container", container);
        //     });
        //     next();
        //     });

        // });
    }
   
     
};