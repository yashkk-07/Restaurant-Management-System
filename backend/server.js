// Use require('dotenv').config() to load environment variables from a .env file
require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const connectDB = require('./config/db');

// --- Route Imports ---
const foodRoutes = require('./routes/foodRoutes');
const userRoutes = require('./routes/userRoutes');
const orderRoutes = require('./routes/orderRoutes');

// Connect to MongoDB Atlas
connectDB();

const app = express();

// --- Core Middleware ---
app.use(helmet()); // Adds crucial security headers
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : ['http://127.0.0.1:5500', 'http://localhost:5500'], // Allow local development
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json()); // Crucial for parsing JSON from the frontend
app.use(compression()); // Compresses API responses for performance

// --- API Routes ---
app.use('/api/food', foodRoutes);
app.use('/api/users', userRoutes);
app.use('/api/orders', orderRoutes);

// --- Health Check Endpoint ---
app.get('/', (req, res) => {
  res.status(200).send('API is running and healthy.');
});

// --- Centralized Error Handling Middleware ---
app.use((err, req, res, next) => {
  console.error(err.stack); // Log the error for debugging
  res.status(500).json({ message: 'An unexpected error occurred on the server.' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running in ${process.env.NODE_ENV} mode on port ${PORT}`));

