/**
 * AngularServeController
 *
 * @description :: Server-side logic for managing Angularserves
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var fs = require('fs');
module.exports = {
	serve: function(req, res) {
		var angularApp = __dirname + '/../../assets/index.html';
		fs.exists(angularApp, function(exists) {
			if (!exists) {
				return res.notFound('The requested file does not exist.');
			}

			fs.createReadStream(angularApp).pipe(res);
		});
	}
};
