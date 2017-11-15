var express = require('express');    
var router = express.Router();
var passport = require('passport');
var LocalStrategy = require('passport-local').Strategy;

router.get('/', function (req, res, next) {
    res.render('index', {
        title: 'BM Login'
    });
});

router.get('/signup', function (req, res, next) {
    res.render('signup', {
        title: 'Create New User Account'
    });
});

router.get('/login', function (req, res, next) {
    res.render('login', {
        title: 'BM Login'
    });
});

router.post('/login', passport.authenticate('local-login', {
        successRedirect: '/profile', // Redirect to the secure profile
        failureRedirect: '/login', // If error redirect to login
        failureFlash: true // Flash messages
    }),
    function (req, res) {
        console.log("auth");
        if (req.body.remember) {
            req.session.cookie.maxAge = 1000 * 60 * 3;
        } else {
            req.session.cookie.expires = false;
        }
        res.redirect('/');
    });

// Test signup
/*router.post('/signup', function (req, res) {
   // console.log(req.body);    
    req.flash('User Account Created');
    res.redirect('/login');
});*/

// Test login
/*router.post('/login', function (req, res) {
    console.log(req.body); 
    
    res.redirect('/profile');
});*/

router.get('/profile', isLoggedIn, function (req, res) {
    console.log("isLoggedIn")
    res.render('/profile', {
        user: req.user
    });
});

router.get('/locked', function (req, res, next) {
    res.render('locked', {
        title: 'Account lock'
    });
});

router.get('/logout', function (req, res, next) {
    console.log("logout");
    req.logout();
    res.redirect('/');
});

function isLoggedIn(req, res, next) {

    // if user is authenticated
    if (req.isAuthenticated())
        return next();

    // No auth- redirect to home
    res.redirect('/');
}
// Country form data. Change to post and fetch from db
var Country = require('../models/country');
router.get('/country', function (req, res, next) {
    var list = [];
    Country.getAllCountries(function (err, rows) {
        if (err) throw err;
        list = JSON.stringify(rows);
        res.send(list);
    });
});

// Handle missing favicon
router.get('/favicon.ico', function (req, res, next) {
    res.status(204);
});

// Return 404 on missing pages
router.get('*', function (req, res) {
    res.status(404).send('Error: 404. Page not found !');
});

module.exports = router;
