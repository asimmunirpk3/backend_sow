import nodemailer from 'nodemailer';

export const sendMail = async (subject, content, email, type = 'TEXT') => {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      /* eslint-disable no-undef */
      user: process.env.SENDEREMAIL,
      pass: process.env.EMAILPASSWORD,
    },
  });

  const mailOptions = {
    /* eslint-disable no-undef */
    from: process.env.SENDEREMAIL,

    to: email,
    subject: subject,
    ...(type === 'HTML' ? { html: content } : { text: content }),
  };

  return await transporter.sendMail(mailOptions);
};
