var db = require('../config/database');

var User = {
    getAllUsers: function (callback) {
        return db.query('SELECT first_name, last_name, email, age FROM user', callback);
    },
    createUser: function (User, callback) {
        //console.log(User);        
        return db.query("START TRANSACTION; INSERT INTO user (first_name, last_name, email, password_hash, age, country_id) VALUES (?,?,?,?,?,?); INSERT INTO log (user_id) SELECT id FROM user WHERE email=?; COMMIT", [User.first_name, User.last_name, User.email, User.password_hash, User.age, User.country_id, User.email], callback);
    },
    deleteUser: function (Id, callback) {
        //console.log("ID: ", id);
        return db.query("START TRANSACTION; DELETE FROM user WHERE id=?; DELETE FROM log WHERE user_id=?; COMMIT", [Id, Id], callback);
    },
    checkUserEmailExists: function (Email, callback) {
        return db.query("SELECT IF(EXISTS(SELECT email from user where email=?),'true','false') AS result", [Email], callback);
    }
};

module.exports = User;
