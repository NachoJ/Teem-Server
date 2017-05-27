/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes map URLs to views and controllers.
 *
 * If Sails receives a URL that doesn't match any of the routes below,
 * it will check for matching files (images, scripts, stylesheets, etc.)
 * in your assets directory.  e.g. `http://localhost:1337/images/foo.jpg`
 * might match an image file: `/assets/images/foo.jpg`
 *
 * Finally, if those don't match either, the default 404 handler is triggered.
 * See `api/responses/notFound.js` to adjust your app's 404 logic.
 *
 * Note: Sails doesn't ACTUALLY serve stuff from `assets`-- the default Gruntfile in Sails copies
 * flat files from `assets` to `.tmp/public`.  This allows you to do things like compile LESS or
 * CoffeeScript for the front-end.
 *
 * For more information on configuring custom routes, check out:
 * http://sailsjs.org/#!/documentation/concepts/Routes/RouteTargetSyntax.html
 */

module.exports.routes = {

	/***************************************************************************
	 *                                                                          *
	 * Make the view located at `views/homepage.ejs` (or `views/homepage.jade`, *
	 * etc. depending on your default view engine) your home page.              *
	 *                                                                          *
	 * (Alternatively, remove this and add an `index.html` file in your         *
	 * `assets` directory)                                                      *
	 *                                                                          *
	 ***************************************************************************/
	//  console.log("get called");

	'/': {
		view: 'homepage'
	},

	"post /auth/login": {
		controller: "AuthController",
		action: "Login",
	},
	"post /auth/fblogin": {
		controller: "AuthController",
		action: "FbLogin",
	},
	"post /auth/register": {
		controller: "AuthController",
		action: "RegisterUser",
	},
	"post /auth/forgotpassword": {
		controller: "AuthController",
		action: "ForgotPassword",
	},
	"get /auth/useractivation/:activationlink": {
		controller: "AuthController",
		action: "UserActivation",
	},
	"post /auth/resetpassword": {
		controller: "AuthController",
		action: "ResetPassword",
	},
	"post /auth/updatepassword": {
		controller: "AuthController",
		action: "UpdatePassword",
	},
	

	"post /sportcenter":{
		controller:"SportcenterController",
		action:"CreateSportcenter"
	},
	"get /sportcenter/user/:userid":{
		controller:"SportcenterController",
		action:"ListSportcenter"
	},
	"get /sportcenter/:id":{
		controller:"SportcenterController",
		action:"SingleSportcenterDisplay"
	},
	"delete /sportcenter/:id":{
		controller:"SportcenterController",
		action:"DeleteSportcenter"
	},
	"put /sportcenter":{
		controller:"SportcenterController",
		action:"UpdateSportcenter"
	},
	"get /sportcenter/autocomplete/:text":{
		controller:"SportcenterController",
		action:"AutocompleteSearch"
	},


	"post /field":{
		controller:"FieldsController",
		action:"CreateField"
	},
	"get /field":{
		controller:"FieldsController",
		action:"ListField"
	},
	"get /field/:id":{
		controller:"FieldsController",
		action:"SingleFieldDisplay"
	},
	"get /field/sportcenter/:scid":{
		controller:"FieldsController",
		action:"SportcenterFieldDisplay"
	},
	"delete /field/:id":{
		controller:"FieldsController",
		action:"DeleteField"
	},
	"put /field":{
		controller:"FieldsController",
		action:"UpdateField"
	},
	

	"post /match":{
		controller:"MatchController",
		action:"CreateMatch"
	},
	"get /match":{
		controller:"MatchController",
		action:"ListMatch"
	},
	"get /match/user/:id/:date":{
		controller:"MatchController",
		action:"ListMatchByUser"
	},
	"get /match/last/user/:id/:date":{
		controller:"MatchController",
		action:"ListLastMatchByUser"
	},
	"get /match/:id":{
		controller:"MatchController",
		action:"SingleMatchDisplay"
	},
	"get /match/team/:id":{
		controller:"MatchController",
		action:"SingleMatchTeamDetail"
	},
	"get /match/unsubscribe/:id":{
		controller:"MatchController",
		action:"MatchUnsubscribe"
	},
	"post /match/nearby":{
		controller:"MatchController",
		action:"FindNearByMatch"
	},
	"delete /match/:id":{
		controller:"MatchController",
		action:"DeleteMatch"
	},
	"put /match":{
		controller:"MatchController",
		action:"UpdateMatch"
	},
	"post /match/join":{
		controller:"MatchController",
		action:"JoinMatch"
	},
	"delete /match/:userid/:matchid":{
		controller:"MatchController",
		action:"LeaveMatch"
	},


	"get /sport":{
		controller:"SportsController",
		action:"getSport"
	},
	"get /sport/:sportid":{
		controller:"SportsController",
		action:"getSportByKey"
	},
	"post /sport":{
		controller:"SportsController",
		action:"CreateSport"
	},
	"post /subsport":{
		controller:"SportsController",
		action:"CreateSubsport"
	},
	"post /subsport/list":{
		controller:"SportsController",
		action:"SubsportList"
	},
	"get /subsport":{
		controller:"SportsController",
		action:"getSubsport"
		
	},		


	"get /currency":{
		controller:"CurrencyController",
		action:"getCurrency"
	},
	"get /currency/:key":{
		controller:"CurrencyController",
		action:"getCurrencyByKey"
	},


	"get /sportplayer":{
		controller:"SportsController",
		action:"getSportPlayer"
	},
	"get /sportplayer/:key":{
		controller:"SportsController",
		action:"getSportPlayerByKey"
	},


	"post /profile":{
		controller:"UserController",
		action:"ProfileUpdate"
	},
	"post /profile/image/:userid":{
		controller:"UserController",
		action:"profileImageUpload"
	},


	"post /invitation":{
		controller:"InvitationController",
		action:"createInvitation"
	},
	"delete /invitation/:id":{
		controller:"InvitationController",
		action:"DeleteInvitation"
	},
	"get /invitation/search/:id/:date":{
		controller:"InvitationController",
		action:"invitationList"
	},
	"get /invitation/usersearch/:text/:id":{
		controller:"InvitationController",
		action:"userSearchList"
	},
	"get /invitation/accept/:id/:invitationid":{
		controller:"InvitationController",
		action:"acceptInvitationByUser"
	},
	

	"post /changeemail":{
		controller: "EmailchangeController",
		action: "CreateEmail",
	},
	"get /changeemail/:activationlink":{
		controller: "EmailchangeController",
		action: "UpdateEmail",
	},
	

	"post /chatmatch":{
		controller:"ChatmatchController",
		action:"CreateChatMatch"
	},
	"get /chatmatch/:id":{
		controller:"ChatmatchController",
		action:"getChatMatch"
	},


	"get /search/:text/:userid":{
		controller:"SearchController",
		action:"userAndSportcenterSearch"
	},
	"get /user/search/:id":{
		controller:"SearchController",
		action:"userSearchDetail"
	},
	"get /sportcenter/search/:id":{
		controller:"SearchController",
		action:"sportcenterSearchDetail"
	},


	"post /user/followers":{
		controller:"SearchController",
		action:"addUserFollowers"
	},
	"post /sportcenter/followers":{
		controller:"SearchController",
		action:"addScFollowers"
	},
	"delete /unfollow/:type/:userid/:followingid":{
		controller:"SearchController",
		action:"unFollowed"
	},
	"get /followers/:userid":{
		controller:"SearchController",
		action:"userFollowers"
	},
	"get /following/:userid":{
		controller:"SearchController",
		action:"userFollowing"
	}

	
	/***************************************************************************
	 *                                                                          *
	 * Custom routes here...                                                    *
	 *                                                                          *
	 * If a request to a URL doesn't match any of the custom routes above, it   *
	 * is matched against Sails route blueprints. See `config/blueprints.js`    *
	 * for configuration options and examples.                                  *
	 *                                                                          *
	 ***************************************************************************/

};
