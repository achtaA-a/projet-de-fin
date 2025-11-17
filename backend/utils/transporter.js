require("dotenv").config();
const nodemailer = require("nodemailer");

// creation de transporter
const transporter = nodemailer.createTransport({
  service: "Gmail",
  auth: {
    user: process.env.EMAIL_USERNAME,
    pass: process.env.EMAIL_PASSWORD,
  }
});

// export de transporter
module.exports = transporter;
