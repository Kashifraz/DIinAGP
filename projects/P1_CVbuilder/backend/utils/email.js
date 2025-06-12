const nodemailer = require('nodemailer');
const config = require('../config');
const logger = require('./logger');

// Create email transporter
const createTransporter = () => {
  return nodemailer.createTransporter({
    host: config.email.host,
    port: config.email.port,
    secure: config.email.port === 465, // true for 465, false for other ports
    auth: {
      user: config.email.user,
      pass: config.email.pass,
    },
  });
};

// Send email
const sendEmail = async (to, subject, html, text = null) => {
  try {
    const transporter = createTransporter();
    
    const mailOptions = {
      from: config.email.from,
      to,
      subject,
      html,
      ...(text && { text }),
    };

    const info = await transporter.sendMail(mailOptions);
    logger.info('Email sent successfully', { messageId: info.messageId, to });
    return info;
  } catch (error) {
    logger.error('Failed to send email', { error: error.message, to });
    throw error;
  }
};

// Send verification email
const sendVerificationEmail = async (email, verificationToken) => {
  const verificationUrl = `${config.cors.origin}/verify-email?token=${verificationToken}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Verify Your Email Address</h2>
      <p>Thank you for registering with CV Builder. Please click the button below to verify your email address:</p>
      <a href="${verificationUrl}" style="display: inline-block; padding: 12px 24px; background-color: #007bff; color: white; text-decoration: none; border-radius: 4px;">Verify Email</a>
      <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
      <p>${verificationUrl}</p>
      <p>This link will expire in 24 hours.</p>
      <p>If you didn't create an account, please ignore this email.</p>
    </div>
  `;

  const text = `
    Verify Your Email Address
    
    Thank you for registering with CV Builder. Please visit the following link to verify your email address:
    ${verificationUrl}
    
    This link will expire in 24 hours.
    If you didn't create an account, please ignore this email.
  `;

  return sendEmail(email, 'Verify Your Email Address', html, text);
};

// Send password reset email
const sendPasswordResetEmail = async (email, resetToken) => {
  const resetUrl = `${config.cors.origin}/reset-password?token=${resetToken}`;
  
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Reset Your Password</h2>
      <p>You requested to reset your password for your CV Builder account. Please click the button below to reset your password:</p>
      <a href="${resetUrl}" style="display: inline-block; padding: 12px 24px; background-color: #dc3545; color: white; text-decoration: none; border-radius: 4px;">Reset Password</a>
      <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
      <p>${resetUrl}</p>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request a password reset, please ignore this email.</p>
    </div>
  `;

  const text = `
    Reset Your Password
    
    You requested to reset your password for your CV Builder account. Please visit the following link to reset your password:
    ${resetUrl}
    
    This link will expire in 1 hour.
    If you didn't request a password reset, please ignore this email.
  `;

  return sendEmail(email, 'Reset Your Password', html, text);
};

// Send welcome email
const sendWelcomeEmail = async (email, name) => {
  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2>Welcome to CV Builder!</h2>
      <p>Hi ${name},</p>
      <p>Welcome to CV Builder! We're excited to help you create professional resumes that stand out.</p>
      <p>Here's what you can do next:</p>
      <ul>
        <li>Complete your profile</li>
        <li>Add your education and work experience</li>
        <li>Choose from our professional templates</li>
        <li>Create and download your CV</li>
      </ul>
      <p>If you have any questions, feel free to reach out to our support team.</p>
      <p>Happy resume building!</p>
      <p>The CV Builder Team</p>
    </div>
  `;

  const text = `
    Welcome to CV Builder!
    
    Hi ${name},
    
    Welcome to CV Builder! We're excited to help you create professional resumes that stand out.
    
    Here's what you can do next:
    - Complete your profile
    - Add your education and work experience
    - Choose from our professional templates
    - Create and download your CV
    
    If you have any questions, feel free to reach out to our support team.
    
    Happy resume building!
    The CV Builder Team
  `;

  return sendEmail(email, 'Welcome to CV Builder!', html, text);
};

module.exports = {
  sendEmail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  sendWelcomeEmail,
};
