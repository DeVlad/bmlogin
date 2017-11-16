var express = require('express');
var app = express();
var port = process.env.PORT || 8000;

var path = require('path');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var passport = require('passport');
var exphbs = require('express-handlebars');
var flash = require('connect-flash');

require('./config/passport')(passport);

// Read cookies
app.use(cookieParser());

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

// View engine
app.engine('.hbs', exphbs({
    extname: '.hbs',
    defaultLayout: 'layout'
}));
app.set('view engine', '.hbs');

// Required for passport
app.use(session({
    secret: 'ItsVerySecretChangeStoreItInEnvVariableInProduction!',
    resave: true,
    saveUninitialized: true
}));

app.use(passport.initialize());

// Persistent login sessions
app.use(passport.session());

// Flash messages stored in session
app.use(flash());

// Handle static files before routes
app.use(express.static(__dirname + '/public'));

// Routes
require('./routes/routes.js')(app, passport);

// Start server
app.listen(port);
console.log('Server is running on: ' + port);
