var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var UserSchema = new Schema(
  {
    userId: String,
    fullName: String,
    accountNumber: Number,
    emailAddress: String,
    registrationNumber: Number,
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", UserSchema);
