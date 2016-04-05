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
var unirest = require('unirest')

module.exports = {
	// Use by calling //http://url.com/api/getSentiment?text="your text here"
	getSentiment: function (req, res) {
		// These code snippets use an open-source library. http://unirest.io/nodejs
		unirest.post("https://twinword-sentiment-analysis.p.mashape.com/analyze/")
		.header("X-Mashape-Key", config.ids.mashape.key)
		.header("Content-Type", "application/x-www-form-urlencoded")
		.header("Accept", "application/json")
		.send("text="+req.query.text)
		.end(function (result) {
			// console.log(result.status, result.headers, result.body);
			return res.send(result.body);
		});	
	},

	getUserData: function (req, res) {
		// if not authenticated, show login page
		if (!req.session.authenticated) {
			return res.sendfile('assets/login.html');
		} else {
			var userid = req.session.passport.user;
			// console.log(req.session);

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
					// console.log(data.tokens.accessToken);
					return data.tokens.accessToken;
				});

				var instagramAccessToken = Passport.findOne({
					protocol: 'oauth2',
	            	user: userid,
	            	provider: 'instagram'
				}).then(function (data) {
					if (data == undefined) return undefined;
					// console.log(data.tokens.accessToken);
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

				return [user, facebookAccessToken, instagramAccessToken, twitterTokens];
			
			}).spread(function (user, facebookAccessToken, instagramAccessToken, twitterTokens) {
				var output = {};
				output.username = user.username;
				output.instagram = {};
				output.facebook = {};
				output.twitter = {};

				if (twitterTokens != undefined) {
					var T = new Twit({
						consumer_key:         config.ids.twitter.consumerKey,
						consumer_secret:      config.ids.twitter.consumerSecret,
						access_token:         twitterTokens.token,
						access_token_secret:  twitterTokens.tokenSecret,
						timeout_ms:           60*1000,  // optional HTTP request timeout to apply to all requests.
					});
				};

				// console.log("instagramAccessToken: " + instagramAccessToken);
				// console.log("twitterTokens: " + twitterTokens);
				// console.log("facebookToken: " + facebookAccessToken);

				// run in parallel
				async.parallel([
					// Get the most recent media published by a user - instagram
					function recentPublish(cb) {
						if (instagramAccessToken != undefined) {
							request.get({
								url: 'https://api.instagram.com/v1/users/self/media/recent/?access_token=' + instagramAccessToken
							}, function (err, res, body) {
								if (err) return res.negotiate(err);
								output.instagram.recentPublish = body;
								// console.log(output);
								cb(false);
							});	
						} else 
							cb(false);
					},

					// Get the list of recent media liked by the owner of the access_token - instagram
					function recentLiked(cb) {
						if (instagramAccessToken != undefined) {
							request.get({
								url: 'https://api.instagram.com/v1/users/self/media/liked?access_token=' + instagramAccessToken
							}, function (err, res, body) {
								if (err) return res.negotiate(err);
								output.instagram.recentLiked = body;
								// console.log(output);
								cb(false);
							});
						} else
							cb(false);
					},

					// Returns a collection of the most recent Tweets posted by the user - Twitter
					function recentTweets(cb) {
						if (twitterTokens != undefined) {
							T.get('statuses/user_timeline', function (err, data, response) {
								output.twitter.recentTweets = data;
								cb(false);
							});
						} else
							cb(false);
					},

					// The feed of posts (including status updates) and links published by this person, or by others on this person's profile - Facebook
					function recentPosts(cb) {
						if (facebookAccessToken != undefined) {
							request.get({
								url: 'https://graph.facebook.com/v2.5/me/feed?access_token=' + facebookAccessToken
							}, function (err, res, body) {
								if (err) return res.negotiate(err);
								output.facebook.recentPosts = body;
								// console.log(output);
								cb(false);
							});
						} else 
							cb(false);
					},

					// All the Pages this person has liked - Facebook
					function userLikes(cb) {
						if (facebookAccessToken != undefined) {
							request.get({
								url: 'https://graph.facebook.com/v2.5/me/likes?access_token=' + facebookAccessToken
							}, function (err, res, body) {
								if (err) return res.negotiate(err);
								output.facebook.userLikes = body;
								// console.log(output);
								cb(false);
							});
						} else 
							cb(false);
					},

				], function cb(err) {
					res.json(output);
				});

			}).fail(function (err) {
				return res.negotiate(err);
			});
		}
	},

	isLoggedIn: function (req, res) {
		if (!req.session.authenticated) {
			return res.json({
				isLoggedIn: 'false'
			});
		} else {
			return res.json({
				isLoggedIn: 'true'
			});
		}
	}
};