var mysql = require('mysql')
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'bmlogin',
    password: '',
    database: 'bmlogin'
});

connection.connect(function (err) {
    if (err) throw err;
    console.log('Database connection established');
});

module.exports = connection;
