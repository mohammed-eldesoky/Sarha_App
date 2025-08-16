import nodemailer from 'nodemailer';

export async function sendEmail({to,subject,html}) {
// step:1 // create a transporter
const transporter =  nodemailer.createTransport({
    host:"smtp.gmail.com",
    port: 587,
    auth:{
        user:process.env.API_USER,
        pass:process.env.API_PASS 
    },

});
// step:2 // send email
await transporter.sendMail({
from:"Sar7a App",
to,
subject,
html,

})

}

