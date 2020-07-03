'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var tweetSchema = Schema({
    tweet: String,
    date: Date
})

module.exports = mongoose.model('tweet', tweetSchema);