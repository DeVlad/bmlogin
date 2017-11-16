var form = require('express-form'),
    field = form.field,
    validate = form.validate;

module.exports = function (app, passport) {

    app.get('/', function (req, res) {
        res.render('index');
    });

    app.get('/login', function (req, res) {
        // render the page and pass in any flash data if it exists
        res.render('login', {
            message: req.flash('loginMessage')
        });
    });

    app.post('/login', passport.authenticate('local-login', {
            successRedirect: '/profile', // redirect to the secure profile section
            failureRedirect: '/login', // redirect back to the signup page if there is an error
            failureFlash: true // allow flash messages
        }),
        function (req, res) {
            console.log("login");

            if (req.body.remember) {
                req.session.cookie.maxAge = 1000 * 60 * 3;
            } else {
                req.session.cookie.expires = false;
            }
            res.redirect('/');
        });

    app.get('/signup', function (req, res) {
        res.render('signup', {
            message: req.flash('signupMessage')
        });
    });

    app.post(
        '/signup',
        // Form filter and validation
        form(
            field("firstName").trim().required().is(/^[A-z]+$/),
            field("lastName").trim().required().is(/^[A-z]+$/),
            field("password").trim().required().is(/^(?=(.*[A-Z]){2})(?=(.*[a-z]){2})(?=(.*[0-9]){2})(?=(.*[!#$%^&*()+_]){2}).{8,}$/),
            field("email").trim().required().isEmail(),
            field("country").trim().required().isInt().is(/^([0-9]|[1-9][0-9]|1[0-9][0-9]|2[0-4][0-9]|25[0-5])$/), // id between 0-255
            validate("rpassword").equals("field::password")
        ),

        // Express request-handler now receives filtered and validated data 
        function (req, res) {
            // Set age to null                
            // TODO: validate country id if exist in db
            var age = Number(req.body.age);
            if (!age > 0 && age <= 120) {
                req.body.age = null;
                //console.log('Set age to null', req.body.age);
            }

            if (!req.form.isValid) {
                // Handle errors 
                console.log(req.form.errors);

            } else {
                console.log(req.body.firstName);
                console.log(req.body.lastName);
                console.log(req.body.age);
                console.log(req.body.country);
                console.log(req.body.email);
                console.log(req.body.password);
                console.log(req.body.rpassword)
                console.log("Valid - Go to pasport");
                passport.authenticate('local-signup', {
                    successRedirect: '/profile',
                    failureRedirect: '/signup',
                    failureFlash: true
                })(req, res);
            }
        }
    );

    app.get('/profile', isLoggedIn, function (req, res) {
        console.log(req.user);
        res.render('profile', {
            user: req.user // get the user out of session and pass to template
        });
    });

    app.get('/logout', function (req, res) {
        req.logout();
        res.redirect('/');
    });

    app.get('/locked', function (req, res, next) {
        res.render('locked', {
            title: 'Account lock'
        });
    });

    // Country form data. TODO: Change to post
    var Country = require('../models/country');
    app.get('/country', function (req, res, next) {
        var list = [];
        Country.getAllCountries(function (err, rows) {
            if (err) throw err;
            list = JSON.stringify(rows);
            res.send(list);
        });
    });

};

// Make sure the user is logged
function isLoggedIn(req, res, next) {
    // if user is authenticated in the session, carry on
    if (req.isAuthenticated())
        return next();
    // if user is not logged redirect to home page
    res.redirect('/');
}
