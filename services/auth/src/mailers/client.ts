import nodemailer from "nodemailer";
import { config } from "../config/app.config";

// Create a reusable transporter object using SMTP transport
export const transporter = nodemailer.createTransport({
  host: config.SMTP.HOST,
  port: config.SMTP.PORT,
  secure: config.SMTP.SECURE,
  auth: {
    user: config.SMTP.USER,
    pass: config.SMTP.PASSWORD,
  },
});

// For development environment, you can also use a test account
export const createDevTransporter = async () => {
  if (config.NODE_ENV === "development" && !config.SMTP.HOST) {
    // Generate test SMTP service account from ethereal.email
    const testAccount = await nodemailer.createTestAccount();
    
    console.log("Ethereal Email credentials:", {
      user: testAccount.user,
      pass: testAccount.pass,
      preview: "https://ethereal.email"
    });
    
    return nodemailer.createTransport({
      host: "smtp.ethereal.email",
      port: 587,
      secure: false,
      auth: {
        user: testAccount.user,
        pass: testAccount.pass,
      },
    });
  }
  
  return transporter;
};