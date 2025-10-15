const express = require('express');
const router = express.Router();
const {
    getAllFood,
    addFood,
    updateFood,
    deleteFood
} = require('../controllers/foodController');

router.route('/').get(getAllFood).post(addFood);
router.route('/:id').put(updateFood).delete(deleteFood);

module.exports = router;

