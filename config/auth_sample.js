// config/auth.js

// expose our config directly to our application using module.exports
module.exports = {

    'facebookAuth' : {
        'clientID'        : 'xxxxxx', // your App ID
        'clientSecret'    : 'xxxxxx', // your App Secret
        'callbackURL'     : 'http://localhost:1339/auth/facebook/callback'
    },

    'twitterAuth' : {
        'consumerKey'        : 'xxxxx',
        'consumerSecret'     : 'xxxxx',
        'callbackURL'        : 'http://localhost:1339/auth/twitter/callback'
    },

    'instagramAuth' : {
        'clientID'         : 'xxxxx',
        'clientSecret'     : 'xxxxx',
        'callbackURL'      : 'http://localhost:1339/auth/instagram/callback'
    },

    'googleAuth' : {
        'clientID'         : 'xxxxxx',
        'clientSecret'     : 'xxxxxx',
        'callbackURL'      : 'http://localhost:1339/auth/google/callback'
    },

    'mashape': {
        'key'  : 'xxxxx' // Mashape Market/API key
    },
    
    'sendgrid': {
        'key'  : 'xxxxx' // SendGrid token/key
    }

};
