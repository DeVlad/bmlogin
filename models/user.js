var mysql = require('mysql');
var dbconfig = require('../config/database');
var connection = mysql.createConnection(dbconfig.connection);

connection.query('USE ' + dbconfig.database);

var User = {
    getAllUsers: function (callback) {
        return connection.query('SELECT first_name, last_name, email, age FROM user', callback);
    },
    getUserById: function (Id, callback) {
        return connection.query('SELECT * FROM user WHERE id = ?', [Id], callback);
    },
    getUserByEmail: function (Email, callback) {
        return connection.query('SELECT * FROM user WHERE email = ?', [Email], callback);
    },
    createUser: function (User, callback) {
       // console.log('create user');
        //console.log(User);        
        return connection.query("START TRANSACTION; INSERT INTO user (first_name, last_name, email, password, age, country_id) VALUES (?,?,?,?,?,?); INSERT INTO log (user_id) SELECT id FROM user WHERE email=?; INSERT INTO user_profile (user_id) SELECT id FROM user WHERE email=?; COMMIT", [User.first_name, User.last_name, User.email, User.password, User.age, User.country_id, User.email, User.email], callback);
    },
    deleteUser: function (Id, callback) {
        //console.log("ID: ", id);
        // TODO: Profile
        return connection.query("START TRANSACTION; DELETE FROM user WHERE id=?; DELETE FROM log WHERE user_id=?; COMMIT", [Id, Id], callback);
    },
    checkUserEmailExists: function (Email, callback) {
        return connection.query("SELECT IF(EXISTS(SELECT email from user where email=?),'true','false') AS result", [Email], callback);
    }
};

module.exports = User;
