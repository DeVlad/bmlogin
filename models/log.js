var mysql = require('mysql');
var dbconfig = require('../config/database');
var connection = mysql.createConnection(dbconfig.connection);

connection.query('USE ' + dbconfig.database);

var Log = {
    getLoginAttemptsByEmail: function (Email, callback) {
        return connection.query('SELECT log.login_attempt FROM user INNER JOIN log ON log.user_id = user.id AND email = ?', [Email], callback);
    },
    increaseLoginAttempts: function (Email, callback) {
        return connection.query('UPDATE log INNER JOIN user ON log.user_id = user.id AND user.email = ? SET log.login_attempt = log.login_attempt + 1', [Email], callback);
    },
    resetLoginAttempts: function (Email, callback) {
        return connection.query('UPDATE log INNER JOIN user ON log.user_id = user.id AND user.email = ? SET log.login_attempt = 1', [Email], callback);
    }
};

module.exports = Log;
