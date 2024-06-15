var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var AccountSchema = new Schema(
  {
    userId: String,
    accountId: String,
    userName: String,
    password: String,
    lastLoginDateTime: Date,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Account", AccountSchema);
