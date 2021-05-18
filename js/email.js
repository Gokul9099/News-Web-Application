const nodemailer = require('nodemailer');


const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: 'kelton.cole60@ethereal.email',
        pass: 'QSMjX67tMaFfyu1qEW'
    }
});
//email, subject, text
const sendMail = (email, subject, text, callback) => {
    const mailOptions = {
        from: email,
        to: 'kelton.cole60@ethereal.email',
        subject: subject,
        text: text
    }

    transporter.sendMail(mailOptions, function (err, data) {
        if (err) {
            console.log('err occurs');
            callback(err, null);
        } else {
            console.log('message send!');
            callback(null, data);
        }
    })

}



module.exports = sendMail;