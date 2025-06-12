# Email Configuration Guide

## Overview

The email notification system has been implemented to automatically send emails when employers respond to job applications. The system uses Nodemailer with SMTP configuration.

## Configuration

### Environment Variables

Add the following variables to your `.env` file:

```env
# SMTP Configuration
SMTP_HOST=smtp.gmail.com        # SMTP server host
SMTP_PORT=587                    # SMTP server port (587 for TLS, 465 for SSL)
SMTP_SECURE=false                # Use secure connection (true for 465, false for 587)
SMTP_USER=your-email@gmail.com  # Your email address
SMTP_PASS=your-app-password     # Your app-specific password
```

### Gmail Setup

1. **Enable 2-Step Verification** on your Google Account
2. Go to https://myaccount.google.com/apppasswords
3. Generate an **App Password** for "Mail" and the device "Other"
4. Use this App Password as your `SMTP_PASS`

### Other Email Providers

#### Outlook/Office 365
```env
SMTP_HOST=smtp.office365.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
```

#### SendGrid
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
```

#### Mailgun
```env
SMTP_HOST=smtp.mailgun.org
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-mailgun-smtp-user
SMTP_PASS=your-mailgun-smtp-password
```

## Email Templates

The system includes the following email templates:

### 1. Application Response Emails
- **Acceptance**: Congratulatory email with interview details if provided
- **Interview Invitation**: Invitation with interview details
- **Rejection**: Professional rejection email
- **Additional Info Request**: Request for more information

### 2. Application Received (Future Use)
- Notification to employers when a new application is received

## How It Works

1. When an employer responds to an application via the API endpoint `POST /api/applications/:id/respond`
2. The response is saved to the database
3. An email is automatically sent to the applicant with the employer's response
4. Email includes company name, job title, and response details (acceptance, rejection, interview invitation, etc.)

## Testing

### Without Real Email Configuration

If SMTP is not configured, the system will log a warning but continue to function normally. No emails will be sent.

### With Real Email Configuration

Once SMTP is configured:
1. Respond to an application as an employer
2. The applicant will receive an email notification
3. Check the backend logs for email sending confirmation

## Error Handling

- Email failures don't break the application flow
- Errors are logged to the console
- The API will still return success even if email sending fails
- Check backend logs for email-related errors

## Security Notes

- Never commit your `.env` file with real credentials
- Use app-specific passwords, not your main account password
- Consider using a dedicated email account for the application
- For production, use a professional email service like SendGrid, Mailgun, or AWS SES

