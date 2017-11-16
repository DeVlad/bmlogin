var mysql = require('mysql');
var dbconfig = require('../config/database');
var connection = mysql.createConnection(dbconfig.connection);

connection.query('USE ' + dbconfig.database);

var Country = {
    getAllCountries: function (callback) {
        return connection.query('SELECT * FROM country ORDER BY country ASC', callback);
    }
};

module.exports = Country;
