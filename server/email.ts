import * as nodemailer from "nodemailer";

// Create reusable transporter for sending emails
export const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: false, // Use TLS
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Generate a 6-digit OTP
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP email
export async function sendOTPEmail(email: string, otp: string): Promise<void> {
  const mailOptions = {
    from: `"InternConnect" <${process.env.SMTP_USER || "noreply@internconnect.com"}>`,
    to: email,
    subject: "Your InternConnect Login Code",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #0D8ABC; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0;">InternConnect</h1>
        </div>
        <div style="background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
          <h2 style="color: #333; margin-top: 0;">Your Login Code</h2>
          <p style="color: #666; font-size: 16px;">Use this code to log in to your InternConnect account:</p>
          <div style="background-color: white; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; color: #0D8ABC; letter-spacing: 8px; border-radius: 4px; margin: 20px 0;">
            ${otp}
          </div>
          <p style="color: #999; font-size: 14px; margin-top: 20px;">This code will expire in 10 minutes.</p>
          <p style="color: #999; font-size: 14px;">If you didn't request this code, you can safely ignore this email.</p>
        </div>
      </div>
    `,
  };

  // In development, log the OTP instead of sending
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log(`\n🔐 OTP for ${email}: ${otp}\n`);
    return;
  }

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ OTP sent to ${email}`);
  } catch (error) {
    console.error("❌ Error sending email:", error);
    // In production, you might want to use a fallback or retry mechanism
    // For now, we'll log and continue (OTP will be logged to console in dev)
    console.log(`\n🔐 OTP for ${email}: ${otp}\n`);
  }
}
