import nodemailer from "nodemailer";

export const sendEmail = async (options) => { 
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: Number(process.env.EMAIL_PORT),
    secure: true,
    auth: {
      user: process.env.EMAIL_USERNAME,
      pass: process.env.EMAIL_PASSWORD,
    },
  });
  const mailOptions = {
    from: `Bridge up <${process.env.EMAIL_USERNAME}>`,
    to: options.email,
    subject: options.subject,
    html: options.message,
  };
  try {
    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.log("Email sending error:", err);
    throw new Error("There was an error sending the email");
  }
};