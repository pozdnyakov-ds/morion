import nodemailer from "nodemailer"

const config = useRuntimeConfig()

const transporter = nodemailer.createTransport({
    host: config.MAIL_HOST,
    port: config.MAIL_PORT,
    secure: config.MAIL_SECURE,
    auth: {
      user: config.MAIL_AUTH_USER,
      pass: config.MAIL_AUTH_PASS,
    },
  });

export default transporter