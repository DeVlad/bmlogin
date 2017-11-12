var express = require('express'),
    app = express(),
    port = process.env.PORT || 8000;

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({
    extended: true
}));

// Handle static files before routes
app.use(express.static(__dirname + '/public'));

// Initialize routes
app.use('/', require('./routes/routes'));


// Country module test
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
    // console.log(rows);
});

function create() {
    var testUser = {
        first_name: 'John',
        last_name: 'Doe',
        email: 'john@example.com',
        password: 'bcryptjs',
        age: 33,
        country_id: 1
    };

    User.createUser(testUser, function (err, rows) {
        if (err) throw err;
        //console.log(rows);
    });
}

//create();
function checkAccountExists() {
    var exists = true;
    // TODO: Make a Promise
    User.checkUserEmailExists('john@example.coms', function (err, rows) {
        if (err) throw err;
        console.log('status', rows[0].result);
        if (rows[0].result == 'false') {
            exists = false;
        }
    });
    console.log(exists);
    return exists;
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
