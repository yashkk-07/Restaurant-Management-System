const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    mobile: { type: String, required: true },
    table: { type: Number, required: true },
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);

