/**
 * ApiController
 *
 * @description :: Server-side logic for managing API calls to social media websites
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var request = require('request');
var async = require('async');
var Twit = require('twit');
var config = require('../../oauth.json');

module.exports = {
	getUserData: function (req, res) {
		// if not authenticated, show login page
		if (!req.session.authenticated) {
			return res.sendfile('assets/login.html');
		} else {
			var userid = req.session.passport.user;

			User.findOne({
				id: userid
			}).then(function (user) {
				if (user == undefined) {
					return res.send('User is not found!');
				}

				var facebookAccessToken = Passport.findOne({
					protocol: 'oauth2',
	            	user: userid,
	            	provider: 'facebook'
				}).then(function (data) {
					if (data == undefined) return undefined;
					return data.tokens.accessToken;
				});

				var instagramAccessToken = Passport.findOne({
					protocol: 'oauth2',
	            	user: userid,
	            	provider: 'instagram'
				}).then(function (data) {
					if (data == undefined) return undefined;
					return data.tokens.accessToken;
				});

				var twitterTokens = Passport.findOne({
					protocol: 'oauth',
	            	user: userid,
	            	provider: 'twitter'
				}).then(function (data) {
					if (data == undefined) return undefined;
					return data.tokens;
				});

				return [facebookAccessToken, instagramAccessToken, twitterTokens];
			
			}).spread(function (facebookAccessToken, instagramAccessToken, twitterTokens) {
				var output = {};
				output.instagram = {};
				output.facebook = {};
				output.twitter = {};

				var T = new Twit({
					consumer_key:         config.ids.twitter.consumerKey,
					consumer_secret:      config.ids.twitter.consumerSecret,
					access_token:         twitterTokens.token,
					access_token_secret:  twitterTokens.tokenSecret,
					timeout_ms:           60*1000,  // optional HTTP request timeout to apply to all requests.
				});

				// run in parallel
				async.parallel([
					// Get the most recent media published by a user - instagram
					function recentPublish(cb) {
						request.get({
							url: 'https://api.instagram.com/v1/users/self/media/recent/?access_token=' + instagramAccessToken
						}, function (err, res, body) {
							if (err) return res.negotiate(err);
							output.instagram.recentPublish = body;
							// console.log(output);
							cb(false);
						});	
					},

					// Get the list of recent media liked by the owner of the access_token - instagram
					function recentLiked(cb) {
						request.get({
							url: 'https://api.instagram.com/v1/users/self/media/liked?access_token=' + instagramAccessToken
						}, function (err, res, body) {
							if (err) return res.negotiate(err);
							output.instagram.recentLiked = body;
							// console.log(output);
							cb(false);
						});
					},

					// Returns a collection of the most recent Tweets posted by the user - Twitter
					function recentTweets(cb) {
						T.get('statuses/user_timeline', function (err, data, response) {
							console.log(data);
							output.twitter.recentTweets = data;
							cb(false);
						});
					},

				], function cb(err) {
					res.json(output);
				});

			}).fail(function (err) {
				return res.negotiate(err);
			});
		}
	}
};