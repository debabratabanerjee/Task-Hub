require('dotenv').config();
const sgMail = require('@sendgrid/mail'); 

const sendGridApiKey = process.env.API_KEY
// console.log(sendGridApiKey)
 sgMail.setApiKey(sendGridApiKey);

const sendWelcomeEmail = (email,name)=>{
    const msg = {
        to: email,
        from: 'harshitkeshari199@gmail.com',
        subject: 'Thanks for joining in!',
        text: `Welcome to the app, ${name}. Let me know how you get with the app!.`
       // html: '<strong>and easy to do anywhere, even with Node.js</strong>',
      };
      sgMail.send(msg);
}
const sendDeleteEmail = (email,name)=>{
    const msg = {
        to: email,
        from: 'harshitkeshari199@gmail.com',
        subject: 'Thanks for using TaskHub',
        text: `Its sad to see you going, ${name}. Let me know how we can inprove our service!.`
       // html: '<strong>and easy to do anywhere, even with Node.js</strong>',
      };
      sgMail.send(msg);
}
module.exports = {
    sendWelcomeEmail,
    sendDeleteEmail
}

