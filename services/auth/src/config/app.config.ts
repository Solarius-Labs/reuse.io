import { getEnv } from "../common/utils/get-env";


const appConfig = () => ({
  NODE_ENV: getEnv("NODE_ENV", "development"),
  APP_ORIGIN: getEnv("APP_ORIGIN", "localhost"),
  PORT: getEnv("PORT", "5000"),
  BASE_PATH: getEnv("BASE_PATH", "/api/v1"),
  MONGO_URI: getEnv("MONGO_URI"),
  JWT: {
    SECRET: getEnv("JWT_SECRET"),
    EXPIRES_IN: getEnv("JWT_EXPIRES_IN", "15m"),
    REFRESH_SECRET: getEnv("JWT_REFRESH_SECRET"),
    REFRESH_EXPIRES_IN: getEnv("JWT_REFRESH_EXPIRES_IN", "30d"),
  },
  MAILER_SENDER: getEnv("MAILER_SENDER", "no-reply@yourdomain.com"),
  // Replace RESEND with SMTP configuration
  SMTP: {
    HOST: getEnv("SMTP_HOST", ""),
    PORT: parseInt(getEnv("SMTP_PORT", "587")),
    SECURE: getEnv("SMTP_SECURE", "false") === "true",
    USER: getEnv("SMTP_USER", ""),
    PASSWORD: getEnv("SMTP_PASSWORD", ""),
  },
});

export const config = appConfig();