/**
 * PageController
 *
 * @description :: Server-side logic for managing pages
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */

module.exports = {
	dashboard: function (req, res) {
		// if not authenticated, show login page
		if (!req.session.authenticated) {
			return res.redirect('/login');
		} else {
			return res.sendfile('assets/dashboard.html');
		}
	},
	login: function (req, res) {
		// if not authenticated, show login page
		if (!req.session.authenticated) {
			return res.sendfile('assets/login.html');
		} else {
			return res.redirect('/dashboard');
		}
	},
	dashboardHTML: function (req, res) {
		res.redirect('/dashboard');
	},
	loginHTML: function (req, res) {
		res.redirect('/login');
	},
	indexHTML: function (req, res) {
		res.redirect('/');
	}
};

