# Email Configuration for InternConnect

## Development Mode (Current Setup)

In development, the app is configured to **log OTPs to the console** instead of sending actual emails. This makes testing easy without needing email credentials.

When you request an OTP:
1. Check the server console/logs
2. Look for a message like: `🔐 OTP for user@example.com: 123456`
3. Use that code to log in

## Production Email Setup

To enable real email sending (for production), you need to configure SMTP credentials.

### Using Gmail SMTP

1. **Get an App Password** (if using Gmail):
   - Go to https://myaccount.google.com/apppasswords
   - Select "Mail" and your device
   - Copy the generated password

2. **Add Environment Variables**:
   ```bash
   SMTP_HOST=smtp.gmail.com
   SMTP_PORT=587
   SMTP_USER=your-email@gmail.com
   SMTP_PASS=your-app-password
   ```

### Using SendGrid (Recommended for Production)

SendGrid offers a free tier (100 emails/day):

1. Sign up at https://sendgrid.com
2. Create an API key
3. Set environment variables:
   ```bash
   SMTP_HOST=smtp.sendgrid.net
   SMTP_PORT=587
   SMTP_USER=apikey
   SMTP_PASS=your-sendgrid-api-key
   ```

### Using Other SMTP Services

Popular alternatives:
- **Mailgun**: Good for transactional emails
- **Amazon SES**: Low-cost, high-volume
- **Postmark**: Fast delivery, good reputation

## Demo Users

The database has been pre-seeded with:

- **Admin**: `admin@internconnect.com`
- **Employer**: `employer@demo.com`
- **Student**: `student@demo.com`

For testing:
1. Go to `/auth`
2. Enter any of the above emails (or create a new one)
3. Check the console for the OTP
4. Enter the 6-digit code

## Testing the Authentication Flow

1. **New User Registration**:
   - Enter a new email (e.g., `test@example.com`)
   - Get OTP from console
   - Verify OTP
   - Select role (Student or Employer)
   - Complete registration

2. **Returning User Login**:
   - Enter an existing email (e.g., `student@demo.com`)
   - Get OTP from console
   - Verify OTP
   - Redirected directly to dashboard

## Security Notes

- OTPs expire after 10 minutes
- Each email can only have one active OTP
- Old OTPs are automatically deleted when requesting a new one
- Passwords are NOT used - this is a passwordless authentication system
