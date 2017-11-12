var db = require('../config/database');

var Country = {
    getAllCountries: function (callback) {
        return db.query('SELECT * FROM country ORDER BY country ASC', callback);
    }
};

module.exports = Country;
