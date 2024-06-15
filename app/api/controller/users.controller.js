const userModel = require("../../models/user.model");
const accountModel = require("../../models/account.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { v4: uuidv4 } = require("uuid");
const { account } = require("../../models");
const dayjs = require("dayjs");
const saltRounds = 10;
const redis = require("redis");

const client = redis.createClient();
client.connect();

client.on("connect", () => {
  console.log("Redis connected");
});

module.exports = {
  create: function async(req, res, next) {
    // Create a User & Account
    const users = new userModel({
      userId: uuidv4(),
      fullName: req.body.fullName,
      accountNumber: req.body.accountNumber,
      emailAddress: req.body.emailAddress,
      registrationNumber: req.body.registrationNumber,
    });

    // Save Tutorial in the database
    users
      .save(users)
      .then((data) => {
        const account = new accountModel({
          userId: data.userId,
          userName: req.body.fullName.replace(" ", ""),
          accountId: uuidv4(),
          password: bcrypt.hashSync(req.body.password, saltRounds),
        });

        account
          .save(account)
          .then((dataAccount) => {
            console.log("Account save success");
          })
          .catch((err) => {
            console.log(err);
          });
        res.send(data);
      })
      .catch((err) => {
        res.status(500).send({
          message:
            err.message || "Some error occurred while creating the Tutorial.",
        });
      });
  },
  authenticate: function async(req, res, next) {
    const user = userModel
      .findOne({
        emailAddress: req.body.email,
      })
      .then((data) => {
        if (!data) {
          res.json({
            status: "error",
            message: "Invalid email/password!!!",
            data: null,
          });
        }
        console.log(data.userId);
        accountModel
          .findOne({
            userId: data.userId,
          })
          .then(async (accountData) => {
            console.log(accountData);
            if (!accountData) {
              res.json({
                status: "error",
                message: "Invalid email/password!!!",
                data: null,
              });
            }
            if (bcrypt.compareSync(req.body.password, accountData.password)) {
              const token = jwt.sign({ id: data.userId }, "secretKey", {
                expiresIn: "1h",
              });

              await accountModel.updateOne(
                {
                  userId: data.userId,
                },
                {
                  lastLoginDateTime: dayjs(),
                }
              );
              res.json({
                status: "success",
                message: "user found!!!",
                data: { user: data, token: token },
              });
            } else {
              res.json({
                status: "error",
                message: "Invalid email/password!!!",
                data: null,
              });
            }
          });
      });
  },
  getByAccountNumber: function async(req, res, next) {
    userModel
      .findOne({
        accountNumber: req.query.keyword,
      })
      .then((data) => {
        // console.log(data);
        if (!data) {
          return res.json({
            status: "error",
            message: "not found",
            data: null,
          });
        }
        client.set(data.userId, JSON.stringify(data), (err, reply) => {
          if (err) throw err;
          console.log(reply);
        });
        res.json({
          status: "success",
          message: "user found!!!",
          data: { user: data },
        });
      });
  },
  getByRegistrationNumber: function async(req, res, next) {
    userModel
      .findOne({
        registrationNumber: req.query.keyword,
      })
      .then((data) => {
        // console.log(data);
        if (!data) {
          return res.json({
            status: "error",
            message: "not found",
            data: null,
          });
        }

        res.json({
          status: "success",
          message: "user found!!!",
          data: { user: data },
        });
      });
  },
  getByLoginDate: function async(req, res, next) {
    userModel
      .find({
        $expr: {
          $lt: [
            {
              $dateAdd: {
                startDate: "$lastLoginDateTime",
                unit: "day",
                amount: 3,
              },
            },
            "$$NOW", // curTime
          ],
        },
      })
      .then((data) => {
        // console.log(data);
        if (!data) {
          return res.json({
            status: "error",
            message: "not found",
            data: null,
          });
        }

        res.json({
          status: "success",
          message: "user found!!!",
          data: { user: data },
        });
      });
  },
};
