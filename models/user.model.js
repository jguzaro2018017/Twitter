'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var userSchema = Schema({
    name: String,
    lastname: String,
    username: String,
    email: String,
    password: String,
    country: String,
    age: Number,
    tweets:[{type: Schema.Types.ObjectId, ref:'tweet'}],
    followers: Number,
    followed:[],
    likeTweet:[],
    
})

module.exports = mongoose.model('user', userSchema);