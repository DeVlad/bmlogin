var db = require('../config/database');

var User = {
    getAllUsers: function (callback) {
        return db.query('SELECT first_name, last_name, email, age FROM user', callback);
    },
    createUser: function (User, callback) {
        //console.log(User);        
        return db.query("START TRANSACTION; INSERT INTO user (first_name, last_name, email, password_hash, age, country_id) VALUES (?,?,?,?,?,?); INSERT INTO log (failed_login) VALUES (0); COMMIT", [User.first_name, User.last_name, User.email, User.password_hash, User.age, User.country_id], callback);
    },
    deleteUser: function (id, callback) {
        return db.query('DELETE FROM user WHERE id=?', [id], callback);
    },
    checkUserEmailExists: function (email, callback) {
        return db.query("SELECT IF(EXISTS(SELECT email from user where email=?),'true','false') AS result", [email], callback);
    }
};

module.exports = User;
