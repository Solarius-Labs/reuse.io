import { config } from "../config/app.config";
import { createDevTransporter, transporter } from "./client";
import nodemailer from "nodemailer";
type Params = {
  to: string | string[];
  subject: string;
  text: string;
  html: string;
  from?: string;
};

const mailer_sender =
  config.NODE_ENV === "development"
    ? `no-reply <dev@example.com>`
    : `no-reply <${config.MAILER_SENDER}>`;

export const sendEmail = async ({
  to,
  from = mailer_sender,
  subject,
  text,
  html,
}: Params) => {
  // For development, use Ethereal if SMTP not configured
  const emailTransporter = config.NODE_ENV === "development" && !config.SMTP.HOST
    ? await createDevTransporter()
    : transporter;
  
  // Send mail with defined transport object
  const info = await emailTransporter.sendMail({
    from,
    to: Array.isArray(to) ? to.join(",") : to,
    subject,
    text,
    html,
  });
  
  // Log Ethereal URL in development mode for easy testing
  if (config.NODE_ENV === "development" && !config.SMTP.HOST) {
    console.log("Email Preview URL:", nodemailer.getTestMessageUrl(info));
  }
  
  return info;
};