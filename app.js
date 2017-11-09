var express = require('express'),
    app = express(),
    port = process.env.PORT || 8000;

var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

// Handle static files before routes
app.use(express.static(__dirname + '/public'));

// Initialize routes
app.use('/', require('./routes/routes'));

var mongoose = require('mongoose');
var uri = 'mongodb://localhost/bmlogin';
var options = {
    useMongoClient: true,
};

mongoose.connect(uri, options, function(error) {
    if(!error) {        
        console.log('Database connection established');        
    }
});

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