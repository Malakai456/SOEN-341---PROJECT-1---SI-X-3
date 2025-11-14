
const nodemailer = require ('nodemailer');

const transporter = nodemailer.createTransport ( {
    service: "hotmail",
    auth: {
        user:"event@hotmail.com", // need to create a real mail acccount
        pass:"" //need the real authentification of the mail account
    }


});


const things = {
    from: "event@hotmail.com" ,
    to: "", // to who you wanna seend it to
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