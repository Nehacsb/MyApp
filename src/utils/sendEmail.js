const nodemailer = require("nodemailer");

const sendEmail = async (to, subject, text) => {
  try {
    console.log("trying to send email ");
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // should be app password if 2FA is enabled
      },
    });

    const info = await transporter.sendMail({
      from: `"UniGo" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      text,
    });
    console.log("otp:",text);
    console.log("✅ Email sent: ", info.messageId);
    console.log("email:",process.env.EMAIL_USER);
  } catch (error) {
    console.error("❌ Email failed:", error);
    throw error; // so the error bubbles up to your route and returns a 500
  }
};

module.exports = sendEmail;
