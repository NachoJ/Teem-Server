module.exports = {
    schema: true,

    attributes: {

        userid: {
            model: 'user',
            required: true
        },
        matchid: {
            model: "match",
            required: true
        },
        teamid: {
            type: 'integer',
            enum: [1, 2]
            
        },
        isbenchplayer:{
            type:"boolean",
            defaultsTo:false
        }
    },
    validationMessages: { //hand for i18n & l10n
		userid: {
			required: 'User id is required'
		},
		matchid: {
			required: 'Match id is required'
		}
        
	},
}