const Food = require('../models/foodModel');

const getAllFood = async (req, res, next) => {
    try {
        const foods = await Food.find({}).sort({ id: 1 });
        res.json(foods);
    } catch (error) {
        next(error);
    }
};

const addFood = async (req, res, next) => {
    const { name, price, category } = req.body;
    if (!name || !price || !category) {
        return res.status(400).json({ message: 'Please provide name, price, and category.' });
    }
    try {
        const highestIdItem = await Food.findOne().sort({ id: -1 });
        const newId = highestIdItem ? highestIdItem.id + 1 : 1;
        const newFood = new Food({ id: newId, name, price, category });
        const savedFood = await newFood.save();
        res.status(201).json(savedFood);
    } catch (error) {
        next(error);
    }
};

const updateFood = async (req, res, next) => {
    try {
        const food = await Food.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!food) return res.status(404).json({ message: 'Food not found' });
        res.json(food);
    } catch (error) {
        next(error);
    }
};

const deleteFood = async (req, res, next) => {
    try {
        const food = await Food.findByIdAndDelete(req.params.id);
        if (!food) return res.status(404).json({ message: 'Food not found' });
        res.json({ message: 'Food item removed successfully' });
    } catch (error) {
        next(error);
    }
};

module.exports = { getAllFood, addFood, updateFood, deleteFood };

