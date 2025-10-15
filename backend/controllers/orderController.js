const Order = require('../models/orderModel');

const createOrder = async (req, res, next) => {
    const { userId, items, totalAmount } = req.body;
    if (!userId || !items || items.length === 0) {
        return res.status(400).json({ message: 'Missing required order information.' });
    }
    try {
        const order = await Order.create({ userId, items, totalAmount });
        res.status(201).json(order);
    } catch (error) {
        next(error);
    }
};

module.exports = { createOrder };

