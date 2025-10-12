
const nodemailer = require ('nodemailer');

const transporter = nodemailer.createTransport ( {
    service: "gmail",
    auth: {
        user:"DoNotReplyEvents341@gmail.com",
        pass:"Soen341!"
    }


});

export function sendConfirmationEmail(to, title, date, location) {
const things = {
    from: "DoNotReplyEvents341@gmail.com" ,//same as user
    to: "DoNotReplyEvents341@gmail.com",
    subject:"Try sending mail",
    text: "It is done!"

};

transporter.sendMail(things,  (err, info)=> {
    if(err){
        console.log(err);
        return;

    }
    console.log("sent: " + info.response);
});

}
