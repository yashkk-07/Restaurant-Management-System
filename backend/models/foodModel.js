const mongoose = require('mongoose');

const foodSchema = new mongoose.Schema({
    id: { type: Number, required: true, unique: true },
    name: { type: String, required: true, trim: true },
    price: { type: Number, required: true },
    category: { type: String, required: true, trim: true },
}, { timestamps: true });

module.exports = mongoose.model('Food', foodSchema);

