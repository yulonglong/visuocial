// route middleware to ensure user is logged in
function isLoggedIn(req, res, next) {
    if (req.isAuthenticated())
        return next();
    res.redirect('/login');
}

// load up the user model
var User = require('../app/models/user');
var request = require('request');
var async = require('async');
var Twit = require('twit');
var unirest = require('unirest');
// load the auth variables
var configAuth = require('../config/auth.js');

module.exports = function (app, passport) {

    // normal routes ===============================================================

    // show the home page (will also have our login links)
    app.get('/', function (req, res) {
        res.render('index.ejs', {
            isAuthenticated: req.isAuthenticated()
        });
    });

    // DASHBOARD SECTION =========================
    app.get('/dashboard', isLoggedIn, function (req, res) {
        res.render('dashboard.ejs', {
            user: req.user,
            isAuthenticated: req.isAuthenticated()
        });
    });
    
    // LOGIN ==============================
    app.get('/login', function (req, res) {
        if (req.isAuthenticated()) res.redirect('/dashboard');
        else {
            res.render('login.ejs', {
                isAuthenticated: req.isAuthenticated()
            });
        }
    });

    // LOGOUT ==============================
    app.get('/logout', function (req, res) {
        req.logout();
        res.redirect('/');
    });
    
    // PRIVACY POLICY ======================
    app.get('/privacy', function (req, res) {
        res.render('privacy.ejs', {
            isAuthenticated: req.isAuthenticated()
        });
    });
    
    // DEMO ======================
    app.get('/demo', function (req, res) {
        res.render('demo.ejs', {
            isAuthenticated: req.isAuthenticated()
        });
    });
    
    // FAQ ======================
    app.get('/faq', function (req, res) {
        res.render('faq.ejs', {
            isAuthenticated: req.isAuthenticated()
        });
    });
    
    // Feedback ======================
    app.get('/feedback', function (req, res) {
        res.render('feedback.ejs', {
            isAuthenticated: req.isAuthenticated(),
            user: req.user,
            status: 'default'
        });
    });
    
    app.post('/feedback', function (req, res) {
        // console.log("REQ BODY " + JSON.stringify(req.body));
        var sendgrid  = require('sendgrid')(configAuth.sendgrid.key);
        var userInformation = '';
        
        if (req.isAuthenticated()) {
            var copiedUser = JSON.parse(JSON.stringify(req.user));
            if (!!copiedUser.facebook) delete copiedUser.facebook.token;
            if (!!copiedUser.twitter) {
                delete copiedUser.twitter.token;
                delete copiedUser.twitter.tokenSecret;
            }
            if (!!copiedUser.instagram) delete copiedUser.instagram.token;
            userInformation = JSON.stringify(copiedUser);
        }
        var email     = new sendgrid.Email({
            to:       'sky@u.nus.edu',
            bcc:      'yulonglong2005@gmail.com',
            from:     'feedback@visuocial.com',
            subject:  '[visuocial.com] ' + req.body.contactSubject,
            html:     'From : ' + req.body.contactName + ' (' + req.body.contactEmail + ')' + '<br><br>' +
                        '<h3>' + req.body.contactSubject + '</h3>' +
                        '<p>' + req.body.contactMessage.replace(/(?:\r\n|\r|\n)/g,'<br>') + '</p>' + '<br>' +
                        userInformation
        });
        
        sendgrid.send(email, function(err, json) {
            if (err) {
                console.error(err);
                res.render('feedback.ejs', {
                    isAuthenticated: req.isAuthenticated(),
                    user: req.user,
                    status: 'failed',
                    message: 'Sorry, failed to send message. Please try again.'
                });
            }
            else {
                console.log("SendGrid Email Success : " + JSON.stringify(json));
                res.render('feedback.ejs', {
                    isAuthenticated: req.isAuthenticated(),
                    user: req.user,
                    status: 'success',
                    message: 'Thank you for your feedback. We will get back to you soon!'
                });
            }
        });
    });

    // =============================================================================
    // AUTHENTICATE (FIRST LOGIN) ==================================================
    // =============================================================================

    // locally --------------------------------
    // LOGIN ===============================
    // show the login form
    // app.get('/login', function (req, res) {
    //     res.render('login.ejs', { message: req.flash('loginMessage') });
    // });

    // process the login form
    // app.post('/login', passport.authenticate('local-login', {
    //     successRedirect: '/dashboard', // redirect to the secure dashboard section
    //     failureRedirect: '/login', // redirect back to the signup page if there is an error
    //     failureFlash: true // allow flash messages
    // }));

    // SIGNUP =================================
    // show the signup form
    // app.get('/signup', function (req, res) {
    //     res.render('signup.ejs', { message: req.flash('signupMessage') });
    // });

    // process the signup form
    // app.post('/signup', passport.authenticate('local-signup', {
    //     successRedirect: '/dashboard', // redirect to the secure dashboard section
    //     failureRedirect: '/signup', // redirect back to the signup page if there is an error
    //     failureFlash: true // allow flash messages
    // }));

    // facebook -------------------------------

    // send to facebook to do the authentication
    app.get('/auth/facebook', passport.authenticate('facebook', { scope: 'email' }));

    // handle the callback after facebook has authenticated the user
    app.get('/auth/facebook/callback',
        passport.authenticate('facebook', {
            successRedirect: '/dashboard',
            failureRedirect: '/'
        }));

    // twitter --------------------------------

    // send to twitter to do the authentication
    app.get('/auth/twitter', passport.authenticate('twitter', { scope: 'email' }));

    // handle the callback after twitter has authenticated the user
    app.get('/auth/twitter/callback',
        passport.authenticate('twitter', {
            successRedirect: '/dashboard',
            failureRedirect: '/'
        }));

    // instagram ---------------------------------

    // send to instagram to do the authentication
    app.get('/auth/instagram', passport.authenticate('instagram', { scope: 'basic' }));

    // the callback after instagram has authenticated the user
    app.get('/auth/instagram/callback',
        passport.authenticate('instagram', {
            successRedirect: '/dashboard',
            failureRedirect: '/'
        }));

    // google ---------------------------------

    // send to google to do the authentication
    app.get('/auth/google', passport.authenticate('google', { scope: ['dashboard', 'email'] }));

    // the callback after google has authenticated the user
    app.get('/auth/google/callback',
        passport.authenticate('google', {
            successRedirect: '/dashboard',
            failureRedirect: '/'
        }));

    // =============================================================================
    // AUTHORIZE (ALREADY LOGGED IN / CONNECTING OTHER SOCIAL ACCOUNT) =============
    // =============================================================================

    // locally --------------------------------
    // app.get('/connect/local', function (req, res) {
    //     res.render('connect-local.ejs', { message: req.flash('loginMessage') });
    // });
    // app.post('/connect/local', passport.authenticate('local-signup', {
    //     successRedirect: '/dashboard', // redirect to the secure dashboard section
    //     failureRedirect: '/connect/local', // redirect back to the signup page if there is an error
    //     failureFlash: true // allow flash messages
    // }));

    // facebook -------------------------------

    // send to facebook to do the authentication
    app.get('/connect/facebook', passport.authorize('facebook', { scope: 'email' }));

    // handle the callback after facebook has authorized the user
    app.get('/connect/facebook/callback',
        passport.authorize('facebook', {
            successRedirect: '/dashboard',
            failureRedirect: '/'
        }));

    // twitter --------------------------------

    // send to twitter to do the authentication
    app.get('/connect/twitter', passport.authorize('twitter', { scope: 'email' }));

    // handle the callback after twitter has authorized the user
    app.get('/connect/twitter/callback',
        passport.authorize('twitter', {
            successRedirect: '/dashboard',
            failureRedirect: '/'
        }));

    // instagram ---------------------------------

    // send to instagram to do the authentication
    app.get('/connect/instagram', passport.authorize('instagram', { scope: 'basic' }));

    // the callback after instagram has authorized the user
    app.get('/connect/instagram/callback',
        passport.authorize('instagram', {
            successRedirect: '/dashboard',
            failureRedirect: '/'
        }));

    // google ---------------------------------

    // send to google to do the authentication
    app.get('/connect/google', passport.authorize('google', { scope: ['dashboard', 'email'] }));

    // the callback after google has authorized the user
    app.get('/connect/google/callback',
        passport.authorize('google', {
            successRedirect: '/dashboard',
            failureRedirect: '/'
        }));

    // =============================================================================
    // UNLINK ACCOUNTS =============================================================
    // =============================================================================
    // used to unlink accounts. for social accounts, just remove the token
    // for local account, remove email and password
    // user account will stay active in case they want to reconnect in the future

    // local -----------------------------------
    // app.get('/unlink/local', isLoggedIn, function (req, res) {
    //     var user = req.user;
    //     user.local.email = undefined;
    //     user.local.password = undefined;
    //     user.save(function (err) {
    //         res.redirect('/dashboard');
    //     });
    // });

    // facebook -------------------------------
    app.get('/unlink/facebook', isLoggedIn, function (req, res) {
        var user = req.user;
        user.facebook.token = undefined;
        user.save(function (err) {
            res.redirect('/dashboard');
        });
    });

    // twitter --------------------------------
    app.get('/unlink/twitter', isLoggedIn, function (req, res) {
        var user = req.user;
        user.twitter.token = undefined;
        user.save(function (err) {
            res.redirect('/dashboard');
        });
    });
    
    // instagram ---------------------------------
    app.get('/unlink/instagram', isLoggedIn, function (req, res) {
        var user = req.user;
        user.instagram.token = undefined;
        user.save(function (err) {
            res.redirect('/dashboard');
        });
    });

    // google ---------------------------------
    app.get('/unlink/google', isLoggedIn, function (req, res) {
        var user = req.user;
        user.google.token = undefined;
        user.save(function (err) {
            res.redirect('/dashboard');
        });
    });
    
    
    // =============================================================================
    // API ENDPOINTS ===============================================================
    // =============================================================================
    
    app.post('/api/getSentiment',function (req, res) {
        // These code snippets use an open-source library. http://unirest.io/nodejs
        unirest.post("https://twinword-sentiment-analysis.p.mashape.com/analyze/")
        .header("X-Mashape-Key", configAuth.mashape.key)
        .header("Content-Type", "application/x-www-form-urlencoded")
        .header("Accept", "application/json")
        .send("text="+req.body["text"])
        .end(function (result) {
            // console.log(result.status, result.headers, result.body);
            return res.send(result.body);
        }); 
    });
    
    app.post('/api/getTopic', function(req, res) {
         // console.log("BODY:\n"+req.body["text"]);
        unirest.post("https://twinword-topic-tagging.p.mashape.com/generate/")
        .header("X-Mashape-Key", configAuth.mashape.key)
        .header("Content-Type", "application/x-www-form-urlencoded")
        .header("Accept", "application/json")
        .send("text="+req.body["text"])
        .end(function (result) {
             // console.log(result.status, result.headers, result.body);
              return res.send(result.body);
        });
    });
    
    app.get('/api/getUserData', function (req, res) {
		// if not authenticated, show login page
        if (!req.isAuthenticated()) {
            return res.json(false);
        } else {
            // console.log(JSON.stringify(req.user));
            
            var facebookToken = req.user.facebook.token;
            var twitterToken = req.user.twitter.token;
            var twitterTokenSecret = req.user.twitter.tokenSecret;
            var instagramToken = req.user.instagram.token;
            
            // console.log("FACEBOOK   " +facebookToken);
            // console.log("TWITTER   " +twitterToken);
            // console.log("TWITTER SCRET " +twitterTokenSecret);
            // console.log("INSTAGRAM   " +instagramToken);
            
            var output = {};
            output.instagram = {};
            output.facebook = {};
            output.twitter = {};
            
            async.parallel([
                function recentPosts(callback) {
                    if (facebookToken != undefined) {
                        request.get({
                            url: 'https://graph.facebook.com/v2.5/me/feed?access_token=' + facebookToken
                        }, function (err, res, body) {
                            if (err) return res.negotiate(err);
                            output.facebook.recentPosts = body;
                            callback(false);
                        });
                    }
                    else callback(false);
                },
                
                function recentTweets(callback) {
                    if (twitterToken != undefined && twitterTokenSecret != undefined) {
                        var T = new Twit({
                            consumer_key:         configAuth.twitterAuth.consumerKey,
                            consumer_secret:      configAuth.twitterAuth.consumerSecret,
                            access_token:         twitterToken,
                            access_token_secret:  twitterTokenSecret,
                            timeout_ms:           60*1000,  // optional HTTP request timeout to apply to all requests.
                        });
                        T.get('statuses/user_timeline', function (err, data, response) {
                            output.twitter.recentTweets = data;
                            callback(false);
                        });
                    }
                    else callback(false);
                },
                
                function recentPublish(callback) {
                    if (instagramToken != undefined) {
                        request.get({
                            url: 'https://api.instagram.com/v1/users/self/media/recent/?access_token=' + instagramToken
                        }, function (err, res, body) {
                            if (err) return res.negotiate(err);
                            output.instagram.recentPublish = body;
                            callback(false);
                        }); 
                    }
                    else callback(false);
                },
                
            ], function callback(err) {
                res.json(output);
            });
        }
    });
    
};
