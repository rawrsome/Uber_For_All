var mongoose = require('mongoose');

var userSchema = new mongoose.Schema({
    name:String,
    email:String,
    password: String,
    phone:String,
    pin: String,
    addresses:[String]
});

mongoose.model('User', userSchema);
