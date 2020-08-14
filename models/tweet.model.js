'use strict'

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var tweetSchema = Schema({
    tweet: String,
    date: String,
    likes: Number,
    numberOfResponses: Number,
    response: [{
        text: String,
        userResponse: String,
        dateResponse: String
    }],
    userProperty: String,
    numberOfRetweets: Number,
    retweet:[{
        coment: String,
        usernameRetweet: String,
        dateRetweet: String
    }]
})

module.exports = mongoose.model('tweet', tweetSchema);