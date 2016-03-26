/**
 * Passport configuration
 *
 * This is the configuration for your Passport.js setup and it where you'd
 * define the authentication strategies you want your application to employ.
 *
 * Authentication scopes can be set through the `scope` property.
 *
 * For more information on the available providers, check out:
 * http://passportjs.org/guide/providers/
 */
var config = require('../oauth.json');

module.exports.passport = {
  twitter: {
    name: 'Twitter',
    protocol: 'oauth',
    strategy: require('passport-twitter').Strategy,
    options: {
      consumerKey: config.ids.twitter.consumerKey,
      consumerSecret: config.ids.twitter.consumerSecret
    }
  },

  facebook: {
    name: 'Facebook',
    protocol: 'oauth2',
    strategy: require('passport-facebook').Strategy,
    options: {
      clientID: config.ids.facebook.clientID,
      clientSecret: config.ids.facebook.clientSecret
    }
  },

  instagram: {
    name: 'Instagram',
    protocol: 'oauth2',
    strategy: require('passport-instagram').Strategy,
    options: {
      clientID: config.ids.instagram.clientID,
      clientSecret: config.ids.instagram.clientSecret
    }
  },
};