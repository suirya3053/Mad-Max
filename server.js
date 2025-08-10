const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const cors = require('cors');
require('dotenv').config();

const app = express();
app.use(cors());  // Frontend-ஐ அனுமதிக்க
app.use(bodyParser.json());

const PORT = process.env.PORT || 3000;

let otpStore = {};

function generateOTP() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

app.post('/send-otp', (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).send('Email is required');

  const otp = generateOTP();
  otpStore[email] = otp;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Your OTP Code',
    text: `Your OTP code is ${otp}`,
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
      return res.status(500).send('Failed to send OTP');
    }
    res.status(200).send('OTP sent');
  });
});

app.post('/verify-otp', (req, res) => {
  const { email, otp } = req.body;
  if (!email || !otp) return res.status(400).send('Email and OTP required');

  if (otpStore[email] && otpStore[email] === otp) {
    delete otpStore[email];
    return res.status(200).send('OTP verified');
  }
  return res.status(400).send('Invalid OTP');
});

app.listen(PORT, () => {
  console.log(`Server started on port ${PORT}`);
});
require('dotenv').config();
console.log('Email:', process.env.EMAIL_USER);
console.log('Pass:', process.env.EMAIL_PASS ? '******' : 'No password set');

