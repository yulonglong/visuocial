/**
 * PageController
 *
 * @description :: Server-side logic for managing pages
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	showDashboard: function (req, res) {
		// if not authenticated, show login page
		if (!req.session.authenticated) {
			return res.sendfile('assets/login.html');
		} else {
			return res.sendfile('assets/dashboard.html');
		}
	}
};

