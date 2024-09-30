import nodemailer from "nodemailer";

// Set up Nodemailer Transport
const transporter = nodemailer.createTransport({
  service: "Gmail", //Any email service can be used
  auth: {
    user: process.env.EMAIL, //Your Email
    pass: process.env.EMAIL_PASSWORD, //Your Email Password
  },
});

export const sendEmail = async (
  customerEmail: string,
  userName: string,
  verificationLink: string
) => {
  const mailOptions = {
    from: process.env.EMAIL, // Sender address
    to: customerEmail, // Recipient email address
    subject: "Email Verification", // Subject line
    context: {
      title: "Verification Email",
      userName: userName,
      url: verificationLink,
    }, // Plain text body
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully!");
  } catch (error: any) {
    console.log("Error in sending Email 💥:=>", error);
  }
};
