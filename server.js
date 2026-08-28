require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const validator = require('validator');
const path = require('path');

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Configure Nodemailer transporter
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
});

// Verify SMTP connection on startup
transporter.verify((error, success) => {
    if (error) {
        console.error('SMTP Connection Failed:', error.message);
    } else {
        console.log('SMTP Server is ready to send emails');
    }
});

app.post('/subscribe', async (req, res) => {
    const email = req.body.email;

    if (!email || !validator.isEmail(email)) {
        return res.status(400).json({
            success: false,
            message: 'Please provide a valid email address.'
        });
    }

    const mailOptions = {
        from: `"DEV@Deakin" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Welcome to DEV@Deakin Daily Insider!',
        html: `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333;">
        <h2 style="color: teal;">Welcome to DEV@Deakin!</h2>
        <p>Thank you for subscribing to our <strong>Daily Insider</strong>.</p>
      </div>
    `,
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`[Email API Response] Status Code: 200 - Email delivered! (ID: ${info.messageId})`);
        return res.status(200).json({ success: true, message: 'Subscribed successfully!' });
    } catch (error) {
        console.error('Email API Error Details:', error);
        return res.status(500).json({ success: false, message: 'Failed to send welcome email. Please try again.' });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));