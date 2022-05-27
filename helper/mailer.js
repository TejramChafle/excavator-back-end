
const nodemailer = require('nodemailer');

// Send Mail function using Nodemailer 
sendMail = async (mailDetails) => {
    console.log({mailDetails});
    // create reusable transporter object using the default SMTP transport
    let mailTransporter = nodemailer.createTransport({
        host: "gmail",
        auth: {
            user: process.env.MAIL_ID,
            pass: process.env.MAIL_PS
        },
    });
    // Sending Email 
    await mailTransporter.sendMail(mailDetails, ((err, response) => {
            if (err) {
                console.log("Failed to send an email with error : ", err);
            } else {
                console.log("Email sent successfully.", response);
            }
        })
    );
}

module.exports = sendMail;