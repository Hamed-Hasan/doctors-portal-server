var nodemailer = require('nodemailer');
var sgTransport = require('nodemailer-sendgrid-transport');

const emailSenderOptions = {
    auth: {
      api_key: process.env.EMAIL_SENDER_KEY
    }
  }
  
  const emailClient = nodemailer.createTransport(sgTransport(emailSenderOptions));
  
  function sendAppointmentEmail(booking){
    const {patient, patientName, treatment, date, slot} = booking;
  
    var email = {
      from: process.env.EMAIL_SENDER,
      to: patient,
      subject: `Your Appointment for ${treatment} is on ${date} at ${slot} is Confirmed`,
      text: `Your Appointment for ${treatment} is on ${date} at ${slot} is Confirmed`,
      html: `
        <div>
          <p> Hello ${patientName}, </p>
          <h3>Your Appointment for ${treatment} is confirmed</h3>
          <p>Looking forward to seeing you on ${date} at ${slot}.</p>
          
          <h3>Our Address</h3>
          <p>Andor Killa Bandorban</p>
          <p>Bangladesh</p>
          <a href="https://web.programming-hero.com/">unsubscribe</a>
        </div>
      `
    };
  
    emailClient.sendMail(email, function(err, info){
      if (err ){
        console.log(err);
      }
      else {
        console.log('Message sent: ', info);
      }
  });
  
  }

  function sendPaymentConfirmationEmail(booking) {
    const { patient, patientName, treatment, date, slot } = booking;
  
    var email = {
      from: process.env.EMAIL_SENDER,
      to: patient,
      subject: `We have received your payment for ${treatment} is on ${date} at ${slot} is Confirmed`,
      text: `Your payment for this Appointment ${treatment} is on ${date} at ${slot} is Confirmed`,
      html: `
        <div>
          <p> Hello ${patientName}, </p>
          <h3>Thank you for your payment . </h3>
          <h3>We have received your payment</h3>
          <p>Looking forward to seeing you on ${date} at ${slot}.</p>
          <h3>Our Address</h3>
          <p>Andor Killa Bandorban</p>
          <p>Bangladesh</p>
          <a href="https://google.com/">unsubscribe</a>
        </div>
      `
    };
  
    emailClient.sendMail(email, function (err, info) {
      if (err) {
        console.log(err);
      }
      else {
        console.log('Message sent: ', info);
      }
    });
  
  }
  
  module.exports = sendPaymentConfirmationEmail;

  module.exports = sendAppointmentEmail;