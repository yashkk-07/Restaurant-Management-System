const express = require('express');
const router = express.Router();
const { loginUser } = require('../controllers/userController');

// POST /api/users/login -> Handles user login session creation
router.post('/login', loginUser);

module.exports = router;

