import nodemailer from "nodemailer";

export const sendMail = async (subject, content, email, type = "TEXT") => {
  var transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.SENDEREMAIL,
      pass: process.env.EMAILPASSWORD,
    },
  });
  if (type == "HTML") {
    var mailOptions = {
      from: process.env.SENDEREMAIL,
      to: email,
      subject: subject,
      html: content,
    };
  } else {
    var mailOptions = {
      from: process.env.SENDEREMAIL,
      to: email,
      subject: subject,
      text: content,
    };
  }

  return await transporter.sendMail(mailOptions);
};
