const mongoose = require("mongoose");

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.db_URI);

    console.log("DB connected successfully");
  } catch (error) {
    console.error("Error", error);
    process.exit(1);
  }
};

module.exports = connectDB;
