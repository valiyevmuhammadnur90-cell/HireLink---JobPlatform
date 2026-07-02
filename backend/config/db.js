const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.DB_URI);

    console.log("DB connected successfully");
  } catch (error) {
    console.error("Error", error);
    process.exit(1);
  }
};

module.exports = connectDB;
