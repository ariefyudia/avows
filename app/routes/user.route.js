const express = require("express");
var jwt = require("jsonwebtoken");
const router = express.Router();
const userController = require("../api/controller/users.controller");
router.post("/register", userController.create);
router.post("/authenticate", userController.authenticate);
router.get("/accountNumber", validateUser, userController.getByAccountNumber);
router.get(
  "/registrationNumber",
  validateUser,
  userController.getByRegistrationNumber
);
router.get("/lastLoginDateTime", validateUser, userController.getByLoginDate);
module.exports = router;

function validateUser(req, res, next) {
  jwt.verify(
    req.headers["x-access-token"],
    "secretKey",
    function (err, decoded) {
      if (err) {
        res.json({ status: "error", message: err.message, data: null });
      } else {
        console.log(decoded);
        // add user id to request
        req.body.userId = decoded.id;
        next();
      }
    }
  );
}
