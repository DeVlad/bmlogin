var express = require('express');
var router = express.Router();
//var User = require('../models/user');

router.get('/', function (req, res) {
    res.sendFile('index.html');
});

router.post('/', function (req,res) {    
    res.send('Logged As: ' + req.body.username);
});

// Handle missing favicon
router.get('/favicon.ico', function (req, res) {
    res.status(204);
});

// Return 404 on missing pages
router.get('*', function (req,res) {
    res.status(404).send('Error: 404. Page not found !');
});

module.exports = router;