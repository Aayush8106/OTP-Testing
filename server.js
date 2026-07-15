import express from "express";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import path from "path";
import nodemailer from "nodemailer";
import session from "express-session";
import dns from "node:dns";

dotenv.config();

dns.setDefaultResultOrder("ipv4first");

const app=express();
app.set("trust proxy",1);
const PORT=process.env.PORT;

//creating a transporter to send mail otp
 const transporter=nodemailer.createTransport({

    service:"gmail",
    auth:{
      user:process.env.EMAIL_USER,
      pass:process.env.EMAIL_APP_PASSWORD
    },

    connectionTimeout: 10000,
    greetingTimeout: 10000,
    socketTimeout: 15000

 });

 //verifying transporter
 transporter.verify((error, success) => {
    if (error) {
        console.log("Transporter error:", error);
    } else {
        console.log("Gmail transporter is ready.");
    }
});

app.use(express.static("frontend"));
app.use(express.json());
app.use(session({
  secret:process.env.SESSION_KEY,
  resave:false,
  saveUninitialized:false,

  cookie:{
    httpOnly:true,
    sameSite:"lax",
    secure:process.env.NODE_ENV === "production"
  }

}));

const __dirname=path.dirname(fileURLToPath(import.meta.url));

app.get("/",(req,res)=>{
   res.sendFile(path.join(__dirname,"frontend","index.html"));
});

app.post("/send-otp", async (req,res)=>{


    //mail comming from client to srver
   console.log(req.body.email);

   //generating a 6 digit otp for verification
    const otp=Math.floor(100000+Math.random()*900000);
    console.log(otp)

    //before sending the otp just save it in user's browser session
     req.session.otp=String(otp);//storing otp in strig cuz it is comming in string from user
     req.session.email = req.body.email;

     console.log("About to send email...");

    try{
    //sending the otp to the client's mail
    await transporter.sendMail({
      from:process.env.EMAIL_USER,
      to:req.body.email,
      subject:"Cheking for OTP",
      html:`Cheking OTP cuz last time it failed so checking this time again. <br> <h2> Your OTP is:<b> ${otp} </b> </h2>`
    });
  }catch (err) {
        console.error("Send OTP error:", err);
        return res.status(500).send("Failed to send OTP.");
    }

       //explictly saving the session
        req.session.save((err) => {

    if (err) {
        console.log("Failed to save session", err);
        return res.status(500).send("Failed to save session.");
    }

    console.log("Session saved successfully.");
    res.status(200).send("OTP sent successfully.");
});

});

// verifying OTP coming from the user
app.post("/verify-otp", async (req, res) => {

    const user_otp = req.body.user_otp;

    if (user_otp === req.session.otp) {

        try {
            // Sending confirmation mail to the client
            await transporter.sendMail({
                from: process.env.EMAIL_USER,
                to: req.session.email,
                subject: "Thank You For Testing.",
                html: `
                    <h2>OTP verified successfully!</h2>
                    <p>Thank you for testing my email OTP system.</p>
                `
            });

        } catch (err) {
            console.error("Send mail error:", err);
            return res.status(500).send("Failed to send confirmation mail.");
        }

        console.log(`${req.session.email} Registered successfully.`);

        // Destroying whole session after successful verification
        req.session.destroy((err) => {

            if (err) {
                console.log("Failed to destroy session", err);
                return res.status(500).send("Failed to destroy session.");
            }

            res.status(200).send("Please Check Your Mail.");
        });

    } else {
        res.status(400).send(
            "OTP is incorrect. Please check the email and try again."
        );
    }
});

app.listen(PORT,()=>{
  console.log(`Server on Port:${PORT}`);
});