const nodemailer = require('nodemailer');

// Create reusable transporter object using SMTP transport
const createTransporter = () => {
  if (!process.env.SMTP_HOST) {
    console.warn('SMTP configuration not found. Email notifications will be disabled.');
    return null;
  }

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  });
};

// Email templates
const emailTemplates = {
  applicationReceived: (applicationData) => ({
    subject: `Application Received - ${applicationData.jobTitle}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #667eea;">Application Received</h2>
        <p>Dear ${applicationData.employerName},</p>
        <p>A new application has been submitted for the position:</p>
        <div style="background: #f8f9fa; padding: 15px; border-radius: 8px; margin: 20px 0;">
          <p><strong>Position:</strong> ${applicationData.jobTitle}</p>
          <p><strong>Company:</strong> ${applicationData.companyName}</p>
          <p><strong>Applicant:</strong> ${applicationData.employeeName}</p>
          <p><strong>Email:</strong> ${applicationData.employeeEmail}</p>
        </div>
        <p>You can review and respond to this application through your dashboard.</p>
        <p style="margin-top: 30px; color: #666; font-size: 14px;">Best regards,<br>Job Application System</p>
      </div>
    `
  }),

  employerResponse: (responseData) => {
    let message, subject;
    
    switch(responseData.responseType) {
      case 'acceptance':
        subject = `Congratulations! Application Accepted - ${responseData.jobTitle}`;
        message = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #28a745;">Application Accepted!</h2>
            <p>Dear ${responseData.employeeName},</p>
            <p>Congratulations! Your application for the position <strong>${responseData.jobTitle}</strong> at ${responseData.companyName} has been accepted.</p>
            ${responseData.message ? `<p style="background: #d4edda; padding: 15px; border-radius: 8px; margin: 20px 0;">${responseData.message}</p>` : ''}
            ${responseData.interviewDetails ? `
              <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h3>Interview Details:</h3>
                ${responseData.interviewDetails.scheduledDate ? `<p><strong>Date:</strong> ${new Date(responseData.interviewDetails.scheduledDate).toLocaleString()}</p>` : ''}
                ${responseData.interviewDetails.location ? `<p><strong>Location:</strong> ${responseData.interviewDetails.location}</p>` : ''}
                ${responseData.interviewDetails.meetingLink ? `<p><strong>Meeting Link:</strong> <a href="${responseData.interviewDetails.meetingLink}">${responseData.interviewDetails.meetingLink}</a></p>` : ''}
                ${responseData.interviewDetails.notes ? `<p><strong>Notes:</strong> ${responseData.interviewDetails.notes}</p>` : ''}
              </div>
            ` : ''}
            <p style="margin-top: 30px; color: #666; font-size: 14px;">Best regards,<br>${responseData.companyName}</p>
          </div>
        `;
        break;
        
      case 'interview_invitation':
        subject = `Interview Invitation - ${responseData.jobTitle}`;
        message = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #007bff;">Interview Invitation</h2>
            <p>Dear ${responseData.employeeName},</p>
            <p>Thank you for your interest in the position <strong>${responseData.jobTitle}</strong> at ${responseData.companyName}. We would like to invite you for an interview.</p>
            ${responseData.message ? `<p style="background: #e7f1ff; padding: 15px; border-radius: 8px; margin: 20px 0;">${responseData.message}</p>` : ''}
            ${responseData.interviewDetails ? `
              <div style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">
                <h3>Interview Details:</h3>
                ${responseData.interviewDetails.scheduledDate ? `<p><strong>Date:</strong> ${new Date(responseData.interviewDetails.scheduledDate).toLocaleString()}</p>` : ''}
                ${responseData.interviewDetails.location ? `<p><strong>Location:</strong> ${responseData.interviewDetails.location}</p>` : ''}
                ${responseData.interviewDetails.meetingLink ? `<p><strong>Meeting Link:</strong> <a href="${responseData.interviewDetails.meetingLink}">${responseData.interviewDetails.meetingLink}</a></p>` : ''}
                ${responseData.interviewDetails.notes ? `<p><strong>Notes:</strong> ${responseData.interviewDetails.notes}</p>` : ''}
              </div>
            ` : ''}
            <p style="margin-top: 30px; color: #666; font-size: 14px;">Best regards,<br>${responseData.companyName}</p>
          </div>
        `;
        break;
        
      case 'rejection':
        subject = `Application Update - ${responseData.jobTitle}`;
        message = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #dc3545;">Application Update</h2>
            <p>Dear ${responseData.employeeName},</p>
            <p>Thank you for your interest in the position <strong>${responseData.jobTitle}</strong> at ${responseData.companyName}.</p>
            <p>After careful consideration, we have decided to move forward with other candidates at this time.</p>
            ${responseData.message ? `<p style="background: #f8d7da; padding: 15px; border-radius: 8px; margin: 20px 0;">${responseData.message}</p>` : ''}
            <p>We appreciate your interest in our company and wish you the best in your job search.</p>
            <p style="margin-top: 30px; color: #666; font-size: 14px;">Best regards,<br>${responseData.companyName}</p>
          </div>
        `;
        break;
        
      case 'additional_info_requested':
        subject = `Additional Information Requested - ${responseData.jobTitle}`;
        message = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #ffc107;">Additional Information Requested</h2>
            <p>Dear ${responseData.employeeName},</p>
            <p>Thank you for your application for the position <strong>${responseData.jobTitle}</strong> at ${responseData.companyName}.</p>
            ${responseData.message ? `<p style="background: #fff3cd; padding: 15px; border-radius: 8px; margin: 20px 0;">${responseData.message}</p>` : ''}
            <p>Please provide the requested information as soon as possible.</p>
            <p style="margin-top: 30px; color: #666; font-size: 14px;">Best regards,<br>${responseData.companyName}</p>
          </div>
        `;
        break;
        
      default:
        subject = `Application Update - ${responseData.jobTitle}`;
        message = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
            <h2 style="color: #667eea;">Application Update</h2>
            <p>Dear ${responseData.employeeName},</p>
            <p>There is an update regarding your application for the position <strong>${responseData.jobTitle}</strong> at ${responseData.companyName}.</p>
            ${responseData.message ? `<p style="background: #e7f1ff; padding: 15px; border-radius: 8px; margin: 20px 0;">${responseData.message}</p>` : ''}
            <p style="margin-top: 30px; color: #666; font-size: 14px;">Best regards,<br>${responseData.companyName}</p>
          </div>
        `;
    }
    
    return { subject, html: message };
  }
};

// Email sending functions
const emailService = {
  // Send email when a new application is received
  sendApplicationReceivedEmail: async (applicationData) => {
    if (!process.env.SMTP_HOST) {
      console.log('Email disabled: No SMTP configuration found');
      return;
    }

    try {
      const transporter = createTransporter();
      if (!transporter) return;

      const template = emailTemplates.applicationReceived(applicationData);
      
      const mailOptions = {
        from: `"Job Application System" <${process.env.SMTP_USER}>`,
        to: applicationData.employerEmail,
        subject: template.subject,
        html: template.html
      };

      const info = await transporter.sendMail(mailOptions);
      console.log('Application received email sent:', info.messageId);
      return info;
    } catch (error) {
      console.error('Error sending application received email:', error);
      // Don't throw error to avoid breaking the application flow
    }
  },

  // Send email when employer responds to application
  sendEmployerResponseEmail: async (responseData) => {
    console.log('=== EMAIL SENDING DEBUG ===');
    console.log('SMTP_HOST:', process.env.SMTP_HOST);
    console.log('SMTP_PORT:', process.env.SMTP_PORT);
    console.log('SMTP_USER:', process.env.SMTP_USER);
    console.log('Response Data:', responseData);
    
    if (!process.env.SMTP_HOST) {
      console.log('Email disabled: No SMTP configuration found');
      return;
    }

    try {
      const transporter = createTransporter();
      console.log('Transporter created:', !!transporter);
      if (!transporter) return;

      const template = emailTemplates.employerResponse(responseData);
      
      const mailOptions = {
        from: `"${responseData.companyName}" <${process.env.SMTP_USER}>`,
        to: responseData.employeeEmail,
        subject: template.subject,
        html: template.html
      };

      console.log('Sending email to:', responseData.employeeEmail);
      const info = await transporter.sendMail(mailOptions);
      console.log('Employer response email sent successfully:', info.messageId);
      console.log('=== EMAIL SENT ===');
      return info;
    } catch (error) {
      console.error('=== EMAIL ERROR ===');
      console.error('Error sending employer response email:', error);
      console.error('Error details:', error.message);
      // Don't throw error to avoid breaking the application flow
    }
  }
};

module.exports = emailService;

