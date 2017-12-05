var express = require('express');
var bodyParser = require('body-parser');
var bcrypt = require('bcrypt-nodejs');
var form = require('express-form2'),
    filter = form.filter,
    field = form.field,
    validate = form.validate;
var app = express();
app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

var UserProfile = require('../models/user_profile');
var User = require('../models/user');
var Country = require('../models/country');

module.exports = function (app, passport) {

    app.get('/', function (req, res) {
        res.render('index');
    });

    app.get('/login', function (req, res) {
        res.render('login', {
            message: req.flash('loginMessage')
        });
    });

    app.post('/login', passport.authenticate('local-login', {
            failureRedirect: '/login',
            successRedirect: '/profile',
            failureFlash: true // Allow flash messages
        }),
        function (req, res) {
            if (req.body.remember) {
                req.session.cookie.maxAge = 1000 * 60 * 3;
            } else {
                req.session.cookie.expires = false;
            }
            res.redirect('/');
        });

    app.get('/signup', function (req, res) {     
        Country.getAllCountries(function (err, rows) {
            if (err) throw err;            
            var countryList = JSON.parse(JSON.stringify(rows)); 
            res.render('signup', {
                message: req.flash('signupMessage'),
                countries: countryList
            });
        });
    });

    app.post(
        '/signup',
        // Form filter and validation        
        form(
            //filter("email").trim().toLowercase(), // Not Working !
            field("firstName").trim().required().is(/^[A-z]+$/),
            field("lastName").trim().required().is(/^[A-z]+$/),
            field("password").trim().required().is(/^(?=(.*[A-Z]){2})(?=(.*[a-z]){2})(?=(.*[0-9]){2})(?=(.*[!#$%^&*()+_]){2}).{8,}$/),
            field("email").trim().required().isEmail(),
            field("country").trim().required().isInt().is(/^([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])$/), // id between 0-255
            validate("rpassword").equals("field::password")
        ),

        // Express request-handler now receives filtered and validated data 
        function (req, res) {
            // Additional validations
            // TODO: validate country id if exist in db

            // Set age to null           
            var age = Number(req.body.age);
            if (!age > 0 && age <= 120) {
                req.body.age = null;
            }
            req.body.email = req.body.email.toLowerCase();

            if (!req.form.isValid) {
                // Handle errors 
                //console.log(req.form.errors);
                //TODO: flash messages
                res.redirect('/signup');

            } else {
                passport.authenticate('local-signup', {
                    successRedirect: '/login',
                    failureRedirect: '/login', // TODO: Why return fail when is success?
                    failureFlash: true
                })(req, res);
            }
        }
    );

    app.get('/profile', isLoggedIn, function (req, res) {
        res.render('profile', {
            user: req.user // get the user out of session and pass to template
        });
    });

    app.post('/profile', isLoggedIn, form(
            // TODO - better verify input and filter
            field("bio").entityEncode().trim().required().max(1000)
        ),
        function (req, res) {
            if (!req.form.isValid) {
                //console.log(req.form.errors);
                //TODO: flash messages
                return res.redirect('/profile');
            }
            if (req.body.bio) {
                var newBiography = {
                    id: req.user.id,
                    biography: req.body.bio
                };
                UserProfile.updateBiography(newBiography, function (err, rows) {
                    if (err) throw err;
                });
            }
            res.render('profile', {
                user: req.user
            });
        });

    app.get('/profile/password', isLoggedIn, function (req, res) {
        res.render('password', {
            user: req.user
        });
    });

    app.post('/profile/password', isLoggedIn, form(
            // TODO - better verify input and filter
            //field("bio").entityEncode().trim().required().max(1000)
            field('npassword').is(/^(?=(.*[A-Z]){2})(?=(.*[a-z]){2})(?=(.*[0-9]){2})(?=(.*[!#$%^&*()+_]){2}).{8,}$/),
            validate('cpassword').equals('field::npassword')
        ),
        function (req, res) {
            if (!req.form.isValid) {
                // console.log(req.form.errors);
                //TODO: flash messages
                return res.redirect('/profile/password');
            }
            var oldPassword = req.body.opassword;
            var newPassword = req.body.npassword;
            var oldHash = req.user.password;
            var newHash;

            if (!bcrypt.compareSync(oldPassword, oldHash)) {
                req.flash('changePassMessage', 'The current password is wrong !');
                res.redirect('/profile/password');
            } else {
                newHash = bcrypt.hashSync(newPassword, null, null);
                var newCredentials = {
                    password: newHash,
                    id: req.user.id
                };
                // Save new hashed password
                User.updatePassword(newCredentials, function (err, rows) {
                    if (err) throw err;
                });
            }
            res.render('password', {
                user: req.user
            });
        });

    app.get('/profile/info', isLoggedIn, function (req, res) {
        Country.getAllCountries(function (err, rows) {
            if (err) throw err;
            var countryList = JSON.parse(JSON.stringify(rows));
            res.render('info', {
                user: req.user,
                message: req.flash('info'),
                countries: countryList
            });
        });
    });

    app.post(
        '/profile/info',
        // Form filter and validation        
        form(
            field("nfirstName").trim().required().is(/^[A-z]+$/),
            field("nlastName").trim().required().is(/^[A-z]+$/),
            field("nemail").trim().required().isEmail(),
            field("country").trim().required().isInt().is(/^([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])$/) // id between 0-255      
        ),

        // Express request-handler now receives filtered and validated data 
        function (req, res) {
            // Additional validations
            // TODO: validate country id if exist in db

            // Set age to null           
            var age = Number(req.body.nage);
            if (!age > 0 && age <= 120) {
                req.body.nage = null;
            }
            if (!req.form.isValid) {
                // Handle errors 
                console.log(req.form.errors);
                //TODO: flash messages
                return res.redirect('/profile/info');
            }

            var newInfo = {
                id: req.user.id,
                first_name: req.body.nfirstName,
                last_name: req.body.nlastName,
                email: req.body.nemail,
                age: req.body.nage,
                country_id: req.body.country
            };
            //console.log(newInfo);
            User.updateInfo(newInfo, function (err, rows) {
                if (err) throw err;
            });
            res.render('info', {
                user: req.user
            });
        }
    );

    app.get('/logout', function (req, res) {
        req.logout();
        res.redirect('/');
    });

    app.get('/locked', function (req, res, next) {
        res.render('locked', {
            title: 'Account lock'
        });
    });    
};

// Is authenticated policy
// Make sure the user is logged
function isLoggedIn(req, res, next) {
    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();
    // if user is not logged redirect to home page
    res.redirect('/');
}
