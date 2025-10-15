const mongoose = require('mongoose');

// This function connects to your MongoDB database using the secure connection string
// from your environment variables.
const connectDB = async () => {
    try {
        // FIX: Using MONGO_URI to match your .env file
        const conn = await mongoose.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Database Connection Error: ${error.message}`);
        // If the database connection fails, the application cannot run.
        process.exit(1); 
    }
};

module.exports = connectDB;

