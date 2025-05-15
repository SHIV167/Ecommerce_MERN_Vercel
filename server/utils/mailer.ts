import nodemailer from "nodemailer";
import dotenv from "dotenv";

dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT) || 587,
  // Use TLS for port 465, STARTTLS for 587
  secure: (Number(process.env.SMTP_PORT) === 465),
  requireTLS: Number(process.env.SMTP_PORT) === 587,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export async function sendMail(options: {
  from?: string;
  to: string;
  subject: string;
  text?: string;
  html?: string;
}) {
  const mailOptions = {
    from: options.from || process.env.SMTP_FROM,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
  };
  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Mail sent:', info.response);
    return info;
  } catch (err) {
    console.error('Mail send error:', err);
    throw err;
  }
}
