var mysql = require('mysql');
var dbconfig = require('../config/database');
var connection = mysql.createConnection(dbconfig.connection);

connection.query('USE ' + dbconfig.database);

var UserProfile = {
    getBiographyById: function (Id, callback) {
        return connection.query('SELECT biography FROM user_profile INNER JOIN user ON user_profile.user_id = user.id AND user.id = ?', [Id], callback);
    },
    updateBiography: function (User, callback) {
        //console.log(User);
        return connection.query('UPDATE user_profile INNER JOIN user ON user_profile.user_id = user.id AND user.id = ? SET biography = ?', [User.id, User.biography], callback);
    }
};

module.exports = UserProfile;
