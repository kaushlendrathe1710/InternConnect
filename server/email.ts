import * as nodemailer from "nodemailer";

let transporter: nodemailer.Transporter | null = null;
let testAccount: { user: string; pass: string; web: string } | null = null;

// Initialize transporter - uses Ethereal test account for development
async function getTransporter(): Promise<nodemailer.Transporter> {
  if (transporter) return transporter;

  // Check if production SMTP credentials are provided
  if (process.env.SMTP_USER && process.env.SMTP_PASS) {
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || "smtp.gmail.com",
      port: parseInt(process.env.SMTP_PORT || "587"),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });
    console.log("📧 Using production SMTP configuration");
  } else {
    // Create Ethereal test account for development
    const account = await nodemailer.createTestAccount();
    testAccount = {
      user: account.user,
      pass: account.pass,
      web: "https://ethereal.email",
    };
    
    transporter = nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: account.user,
        pass: account.pass,
      },
    });
    
    console.log("📧 Using Ethereal Email for testing");
    console.log(`📧 View sent emails at: ${testAccount.web}`);
    console.log(`📧 Login: ${account.user} / ${account.pass}`);
  }

  return transporter;
}

// Generate a 6-digit OTP
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// Send OTP email
export async function sendOTPEmail(email: string, otp: string): Promise<{ previewUrl?: string }> {
  const transport = await getTransporter();

  const mailOptions = {
    from: '"InternConnect" <noreply@internconnect.com>',
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
    const info = await transport.sendMail(mailOptions);
    console.log(`✅ OTP email sent to ${email}`);
    
    // Get preview URL for Ethereal emails
    const previewUrl = nodemailer.getTestMessageUrl(info);
    if (previewUrl) {
      console.log(`📧 Preview email at: ${previewUrl}`);
      return { previewUrl: previewUrl as string };
    }
    
    return {};
  } catch (error) {
    console.error("❌ Error sending email:", error);
    throw new Error("Failed to send OTP email");
  }
}
