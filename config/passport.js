// Passport.js Authentication

var express = require('express'),
    app = express()
var bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({
    extended: true
}));
app.use(bodyParser.json());

var LocalStrategy = require('passport-local').Strategy;
var mysql = require('mysql');
var bcrypt = require('bcrypt-nodejs');
var dbconfig = require('./database');
var connection = mysql.createConnection(dbconfig.connection);

connection.query('USE ' + dbconfig.database);

var User = require('../models/user');
var UserProfile = require('../models/user_profile');
var Log = require('../models/log');

module.exports = function (passport) {
    // Serialize the user for the session
    passport.serializeUser(function (user, done) {
        done(null, user.id);
    });
    // Deserialize the user
    passport.deserializeUser(function (id, done) {
        var accountData;

        var q1 = new Promise(function (resolve, reject) {
            User.getUserById(id, function (err, rows) {
                resolve(rows[0]);
            });
        });

        var q2 = new Promise(function (resolve, reject) {
            UserProfile.getBiographyById(id, function (err, rows) {
                resolve(rows[0]);
            });
        });

        Promise.all([q1, q2]).then(function(values) {
            accountData = values[0];

            if (values[1].biography === undefined) { // Prevent undefined error
                values[1].biography = '';
            }
            accountData.biography = values[1].biography;
            done(null, accountData);
        });

    });

    // Sign Up
    passport.use(
        'local-signup',
        new LocalStrategy({
                usernameField: 'email',
                passwordField: 'password',
                passReqToCallback: true // Allows passing the request to callback
            },
            function (req, email, password, done) {
                // Check if login user already exists
                User.getUserByEmail(email, function (err, rows) {
                    if (err)
                        return done(err);
                    if (rows.length) {
                        // console.log('Username is taken');
                        return done(null, false, req.flash('signupMessage', 'Username is already taken.'));
                    } else {
                        // If there is no user with that username create the user                    
                        var newUser = {
                            first_name: req.body.firstName,
                            last_name: req.body.lastName,
                            age: req.body.age,
                            country_id: req.body.country,
                            email: email,
                            password: bcrypt.hashSync(password, null, null)
                        }

                        User.createUser(newUser, function (err, rows) {
                            if (err) throw err;
                            //console.log("Created new user: ", email);
                        });

                        return done(null, rows.insertId);
                    }
                });
            })
    );

    // Login
    passport.use(
        'local-login',
        new LocalStrategy({
                usernameField: 'email',
                passwordField: 'password',
                passReqToCallback: true
            },
            function (req, email, password, done) {
                var locked = false;
                // Check if account is locked
                Log.getLoginAttemptsByEmail(email, function (err, rows) {
                    // User not found
                    if (!rows.length) {
                        // Prevents Type error if mail is not found 
                        var rows = [{
                            login_attempt: 0
                        }];
                    }
                    //console.log('Login attempts', rows[0]);
                    if (rows[0].login_attempt >= 4) { // Login attempts: 0 never logged, 4 locked
                        //return done(null, false, req.flash('loginMessage', 'Account is locked! Please contact the support team.'));
                        locked = true;
                    }
                });

                User.getUserByEmail(email, function (err, rows) {
                    if (err)
                        return done(err);
                    // I Moved lock here to prevent: Can't set headers after they are sent error. TODO: research
                    if (locked) {
                        return done(null, false, req.flash('loginMessage', 'Account is locked! Please contact the support team.'));
                    }
                    if (!rows.length) {
                        return done(null, false, req.flash('loginMessage', 'No user found.'));
                    }
                    // User is found but the password is wrong
                    if (!bcrypt.compareSync(password, rows[0].password)) {
                        //console.log('Wrong Pass attempt for :', email);
                        Log.increaseLoginAttempts(email, function (err, rows) {
                            //console.log('Increase login attempts error!');
                            if (err)
                                return done(err);
                        });
                        return done(null, false, req.flash('loginMessage', 'Wrong password !'));
                    }
                    // Reset login attempts 
                    Log.resetLoginAttempts(email, function (err, rows) {
                        if (err)
                            return done(err);
                    });
                    // Returns successful user
                    return done(null, rows[0]);
                });
            })
    );
};
