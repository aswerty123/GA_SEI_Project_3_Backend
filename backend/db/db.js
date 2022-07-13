const mongoose = require("mongoose");

const connectDB = async (uri) => {
  try {
    await mongoose.connect(uri);
    console.log("connected to DB");
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};

module.exports = connectDB;
