const User = require('../models/userModel');

const loginUser = async (req, res, next) => {
    const { name, mobile, table } = req.body;
    if (!name || !mobile || !table) {
        return res.status(400).json({ message: 'Please provide name, mobile, and table number.' });
    }
    try {
        const user = await User.create({ name, mobile, table });
        res.status(201).json(user);
    } catch (error) {
        next(error);
    }
};

module.exports = { loginUser };

