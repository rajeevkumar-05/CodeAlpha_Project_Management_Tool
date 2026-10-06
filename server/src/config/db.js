const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/codealpha_project_management');
    console.log(` MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(` MongoDB Connection Error: ${error.message}`);
    console.log(' Note: Please ensure MongoDB is running locally or provide a valid MONGODB_URI in server/.env');
  }
};

module.exports = connectDB;
