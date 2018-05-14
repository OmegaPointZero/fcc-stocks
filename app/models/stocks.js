const mongoose = require('mongoose')

var stockSchema = new mongoose.Schema({
        ticker: String,
    }, { collection: 'stocks' }
);


module.exports = mongoose.model('stock', stockSchema) 
