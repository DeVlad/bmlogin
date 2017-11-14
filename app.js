var express = require('express'),
    app = express(),
    port = process.env.PORT || 8000;

var path = require('path');
var flash = require('connect-flash');

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({
    extended: true
}));

// View engine
var exphbs  = require('express-handlebars');
app.engine('.hbs', exphbs({extname: '.hbs', defaultLayout: 'layout'}));
app.set('view engine', '.hbs');

// Handle static files before routes
app.use(express.static(__dirname + '/public'));

// Initialize routes
app.use('/', require('./routes/routes'));


/*// Country module test
var Country = require('./models/country');
Country.getAllCountries(function (err, rows) {
    if (err) throw err;
    //console.log(rows);
});

// User module test
var User = require('./models/user');
User.getAllUsers(function (err, rows) {
    if (err) {
        console.log('Error creating user');
        //throw err;
    }
    //console.log(rows);
});*/

function create() {
    var testUser = {
        first_name: 'Prazz',
        last_name: 'Doe',
        email: 'prazz@example.com',
        password_hash: 'bcrypt',
        age: 31,
        country_id: 1
    };

    User.createUser(testUser, function (err, rows) {
        if (err) throw err;
        //console.log(rows);
    });
}

//create();

function eraseUser() {
    var id = 8;
    User.deleteUser(id, function (err, rows) {
        if (err) throw err;
        //console.log(rows);
    });

}
//eraseUser();

function checkAccountExists() {
    var exists = true;
    // TODO: Make a Promise
    var promise = User.checkUserEmailExists('john@example.com', function (err, rows) {
        if (err) throw err;
        console.log('status', rows[0].result);
        if (rows[0].result == 'false') {
            exists = false;
        }
    });
    promise.then(console.log('done promise'))
    console.log('done');

}
//checkAccountExists();

// Error handler
app.use(function (err, req, res, next) {
    // if URIError occurs
    if (err instanceof URIError) {
        err.message = 'Failed to decode param at: ' + req.url;
        err.status = err.statusCode = 400;
        return res.send('Error: ' + err.status + '<br>' + err.message);
    }
});

app.listen(port, console.log('Listening on port:', port));
