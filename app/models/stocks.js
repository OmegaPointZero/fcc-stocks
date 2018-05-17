const mongoose = require('mongoose')

var stockSchema = new mongoose.Schema({
        ticker: String,
        rgb : String,
    }, { collection: 'stocks' }
);


module.exports = mongoose.model('stock', stockSchema) 
