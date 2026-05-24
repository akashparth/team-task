const { Resend } = require('resend');

const resend = new Resend(process.env.RESEND_API_KEY);

const sendEmail = async (to, subject, text) => {
  try {

    const response = await resend.emails.send({
      from: 'noreply@merodiscount.net',
      to,
      subject,
      text,
    });

    console.log('Email sent successfully');
    console.log(response);

  } catch (error) {

    console.log('EMAIL ERROR ↓↓↓');
    console.log(error);

  }
};

module.exports = sendEmail;