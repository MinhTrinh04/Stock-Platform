const mongoose = require('mongoose');

const instrumentSchema = new mongoose.Schema({
    symbol: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    name: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true,
        enum: ['stock', 'forex', 'crypto']
    },
    description: String
}, {
    timestamps: true
});

module.exports = mongoose.model('Instrument', instrumentSchema); 