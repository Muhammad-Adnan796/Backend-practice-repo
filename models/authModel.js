const mongoose = require("mongoose");

const UserAuthSchema = mongoose.Schema({
  userName: {
    type: String,
    required: [true, "User name is required"],
  },
  password: {
    type: String,
    required: [true, "User password is required"],
  },
  contact: {
    type: Number,
  },
  image:{
    data:Buffer,
    contentType:String
  }
});

const UserAuthModel = mongoose.model("Users", UserAuthSchema);
module.exports = UserAuthModel;
