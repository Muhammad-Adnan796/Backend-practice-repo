const mongoose = require("mongoose");

// Create a Mongoose schema for the user
const userSchema = new mongoose.Schema({
  id: Number,
  name: String,
  fatherName: String,
  userInstituteName: String,
  age: Number,
});

// Create a Mongoose model using the schema
const UserModel = mongoose.model("User", userSchema);

module.exports = UserModel;





