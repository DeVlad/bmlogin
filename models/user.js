var mongoose = require('mongoose');
var Schema = mongoose.Schema;

// Mongoose promises are depricated use global
mongoose.Promise = global.Promise;

var UserSchema = new Schema({
    username: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    },
}, {
    versionKey: false
});

module.exports = mongoose.model('User', UserSchema);