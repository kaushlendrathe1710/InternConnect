import * as nodemailer from "nodemailer";

// Create transporter using provided SMTP credentials
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_PORT === "465", // true for 465, false for 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false
  }
});

// Verify transporter configuration on startup
transporter.verify((error, success) => {
  if (error) {
    console.error("❌ SMTP Configuration Error:", error.message);
    console.log("📧 SMTP_HOST:", process.env.SMTP_HOST);
    console.log("📧 SMTP_PORT:", process.env.SMTP_PORT);
    console.log("📧 SMTP_USER:", process.env.SMTP_USER);
  } else {
    console.log("✅ SMTP server is ready to send emails");
  }
});

// Generate a 6-digit OTP
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP email
export async function sendOTPEmail(email: string, otp: string): Promise<void> {
  const mailOptions = {
    from: `"InternConnect" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Your InternConnect Login Code",
    text: `Your OTP code is: ${otp}. This code will expire in 10 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background-color: #0D8ABC; padding: 20px; border-radius: 8px 8px 0 0; text-align: center;">
          <h1 style="color: white; margin: 0;">InternConnect</h1>
        </div>
        <div style="background-color: #f9f9f9; padding: 30px; border-radius: 0 0 8px 8px;">
          <h2 style="color: #333; margin-top: 0;">Your Login Code</h2>
          <p style="color: #666; font-size: 16px;">Use this code to log in to your InternConnect account:</p>
          <div style="background-color: white; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; color: #0D8ABC; letter-spacing: 8px; border-radius: 4px; margin: 20px 0; border: 2px dashed #0D8ABC;">
            ${otp}
          </div>
          <p style="color: #999; font-size: 14px; margin-top: 20px;">This code will expire in 10 minutes.</p>
          <p style="color: #999; font-size: 14px;">If you didn't request this code, you can safely ignore this email.</p>
        </div>
        <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
          <p>© 2024 InternConnect. All rights reserved.</p>
        </div>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log(`✅ OTP email sent to ${email}`);
  } catch (error: any) {
    console.error("❌ Error sending email:", error.message);
    throw new Error("Failed to send OTP email");
  }
}
