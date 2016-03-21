// Rename this file to db.js and enter the config accordingly

var config = {
    userName: 'yourusername',
    password: 'yourpassword',
    server: 'yourserver.database.windows.net',
    // When you connect to Azure SQL Database, you need these next options.
    options: {encrypt: true, database: 'yourdatabase'}
};

module.exports = {
	config: config
};
