const mongoose = require('mongoose')
const bcrypt = require('bcrypt-nodejs')

var pollSchema = new mongoose.Schema({
    user : String,
    options: Array,
    votes: Array,
    }, {collection: 'polls'}
);

module.exports = mongoose.model('Poll', pollSchema);
