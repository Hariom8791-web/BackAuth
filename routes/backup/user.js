import express from 'express'
import bcrypt from 'bcrypt'
import nodemailer from 'nodemailer'
import jwt from 'jsonwebtoken'

const router =express.Router();

import {User} from '../models/User.js'
import {Otpdb} from '../models/Otp.js'
import{Appdb} from '../models/Appdb.js'
import { Sentmaildb } from '../models/Sentmail.js';


var tempusername;
var temppassword;
var tempemail;
var sessionusername;
var globaldecoded;
var sessiontokenz;
router.get('/',(req,res)=>{
    res.json("Hello")
})
router.post('/Forgotpassword', async (req, res) => {
    const { email } = req.body
    console.log(email)
    try {
        const user = await Appdb.findOne({ email:email })
        if (!user) {
            console.log("usernot found in appdb",user)
            return res.json({ status:false,message: "user  not registered" })
        }
        const tokens = jwt.sign({ id: user._id }, process.env.KEY, { expiresIn: '2h' });

        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'hariomsingh8791@gmail.com',
                pass: 'uadndlkrqlldzjsd'
            }
        });

        var mailOptions = {
            from: 'hariomsingh8791@gmail.com',
            to: email,
            subject: 'Reset Link for Password Brain Radar',
            text: `http://localhost:5173/resetPassword/${tokens}`
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                //   console.log(error);
                return res.json({ message: "email not  sent" })
            } else {
                //   console.log('Email sent: ' + info.response);
                return res.json({ status: true, message: "email sent" })
            }
        });
    }

    catch (err) {
        console.log(err)

    }
})
router.post("/resetPassword/:token", async (req, res) => {
    const { token } = req.params;
    const { password } = req.body;
    console.log("password is ", password)
    console.log("token is ", token)
    try {
        const decoded = await jwt.verify(token, process.env.KEY);
        const id = decoded.id;
        const hashPassword = await bcrypt.hash(password, 10);
        await Appdb.findByIdAndUpdate({ _id: id }, { password: hashPassword });
        return res.json({ status: true, message: "updated password" });
    } catch (err) {
        return res.json("invalid token");
    }
});

router.post('/ChetakMail', async (req,res)=>{
    const { emails,textmsg,subject,htmlFile,name} = req.body;
    console.log(emails,textmsg,subject,htmlFile,name ) 
    const doc = await Appdb.findOne({ username:name });
    const appemail = await doc.Appemail;
    const apppassword = await doc.AppPassword;
    console.log(appemail,apppassword)
    
    for(let j=0;j<emails.length-1;j++){
        const currentemail=emails[j]
        console.log("currentemail/sessionusername",currentemail,sessionusername)
            const savesentmail=new Sentmaildb({
                sentemail:currentemail,
                byuser:sessionusername,
                

            })
            await savesentmail.save()
    }

    try {
      const transporter = nodemailer.createTransport({
        // configure your email service
        service: 'Gmail',
        auth: {
          user: `${appemail}`,
          pass: `${apppassword}` 
        }
      });
      for (let i=0; i<emails.length-1; i++) {
        let email= emails[i]
      await   transporter.sendMail({
          from: `${appemail}`,
          to: email,
          subject: `${subject}`,
          text: `${textmsg}`,
          html:`${htmlFile}`
          
      });
      console.log('Emails sending',i);
      }
      console.log('Emails sent successfully');
      
      return res.json({ status: true, message: 'Emails final successfully'});
    } catch (error) {
      console.error('Error sending emails:', error);
      return res.json({status:true, error: 'Email sent successfully' });
    }
  });

router.get('/dashboard',async (req, res) => {
    console.log("sessiontokenz ",sessiontokenz)
    if (!sessiontokenz) {
        return res.status(401).json({ status: false, message: "Token not provided" });
    }
    const decoded= await jwt.verify(sessiontokenz, process.env.JWT_SECRET)
    if(decoded.username==sessionusername){
        res.json({ status: true, message: "Token is valid", username: decoded.username, Appemail: decoded.Appemail });
    }
    else {
        res.json({status :false  ,message :"toke is out dated"})
    }
    
});

router.post('/logout', (req, res) => {
    // Invalidate the token by not sending any response, or you can return a success message if needed
    sessiontokenz=null;
    sessionusername=null;
    res.status(200).json({ status: true, message: "Logout successful" });
});

router.post('/signup',async (req,res)=>{
    const {username,email,password}=req.body
    const emailfounded= await Appdb.findOne({email})
    const usernamefounded= await Appdb.findOne({username})
    if(usernamefounded){
        return res.json({status :false, message :"Kindly choose another username"})
    }
    if(emailfounded){
        return res.json({status : false ,message :"Already registered"})
    }
    function generateOTP() {
        return Math.floor(100000 + Math.random() * 900000);
    }
    const OTP = generateOTP();
    const saveotp =new Otpdb({
        otp:OTP,
    })
    await saveotp.save()


     const hashpassword=await bcrypt.hash(password ,10)
      const newUser= new User({
          username:username,
          email:email,
          password:password,
      })
          await newUser.save()
          tempemail=email
          tempusername=username
          temppassword=hashpassword
        //   return res.json({message:"Recorded successfully"})
    try {
        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: 'hariomsingh8791@gmail.com',
                pass: 'uadndlkrqlldzjsd'
            }
        });

        var mailOptions = {
            from: 'hariomsingh8791@gmail.com',
            to: email,
            subject: 'Your OTP For Signup in BrainRadar',
            text: `YOUR OTP IS : ${OTP},You are most welcome !`
        };

        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                //   console.log(error);
                return res.json({status:false, message: "Otp not  sent" })
            } else {
                //   console.log('Email sent: ' + info.response);
                return res.json({ status: true, message: "Otp sent" })
            }
        });
    }

    catch (err) {
        console.log(err)
    }

})

router.post('/Verification',async (req,res)=>{
    const {code} =req.body
    console.log(code)
    const otpmatch = await Otpdb.findOne({ otp: code });

    if (otpmatch) {
        await Otpdb.deleteOne({ otp: code })
        return res.json({ status: true, message: "OTP matched" });
        
    } else {
        
        return res.json({ status: false, message: "OTP does not match" });

    }

}) 

router.post('/login', async (req, res) => {
    const { Email, password } = req.body;

    try {
        const user = await Appdb.findOne({ email: Email });

        if (!user) {
            return res.status(404).json({ status: false, message: "Email not found" });
        }
        sessionusername= user.username
        console.log("sessionusername",sessionusername)
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (passwordMatch) {
            const token = await  jwt.sign({
                username: user.username,
                Appemail: user.Appemail,
                Apppassword: user.AppPassword
            }, process.env.JWT_SECRET, { expiresIn: '2h' });
            sessiontokenz=token;
            console.log("sessiontokenz",sessiontokenz)

            return res.json({ status: true, message: "Successfully logged in"});
        } else {
            return res.status(401).json({ status: false, message: "Incorrect password" });
        }
    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ status: false, message: "Internal Server Error" });
    }
});

// router.post('/Login', async (req, res) => {
//     const { Email, password } = req.body;

//     console.log(password, Email);

//     const emailmatch = await Appdb.findOne({ email: Email });
//     console.log(emailmatch);
//     if (emailmatch == null) {
//         return res.json({ status: false, message: "Email not found" });
//     }
//     const passwordMatch = await bcrypt.compare(password, emailmatch.password);
//     if (passwordMatch) {
//         console.log("Password comparison result: true");
//         const token = jwt.sign({
//             username: emailmatch.username,
//             Appemail: emailmatch.Appemail,
//             Apppassword: emailmatch.AppPassword
//         }, process.env.JWT_SECRET, { expiresIn: '2h' });

//         req.session.token = token;
//         req.session.username = emailmatch.username;
//         req.session.Appemail =emailmatch.Appemail;
//         console.log("req.session.username",req.session.username);
//         console.log("req.session.Appemail",req.session.Appemail);
//         return res.json({ status: true, message: "Successfully logged in", token });
//     } else {
//         console.log("Password comparison result: false");
//         return res.json({ status: false, message: "Enter Password correctly to login" });
//     }
// });

router.post('/AppPasssword', async (req, res) => {
    const { Appemail, AppPassword } = req.body;
    const Appemailfounded= await Appdb.findOne({Appemail})

    console.log(Appemail, AppPassword);
    if(Appemailfounded){
        return res.json({status:false,message:"This App Email Already in use on Our Server Kindly Choose another one "})
    }
    try {
        var transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: `${Appemail}`,
                pass: `${AppPassword}`
            }
        });

        var mailOptions = {
            from: `${Appemail}`,
            to: `${Appemail}`, // Sending email to the same address as sender for testing purposes
            subject: 'App email checking',
            text: `checking  : ${Appemail}`
        };

        transporter.sendMail(mailOptions, async function (error, info) {
            if (error) {
                console.log(error);
                return res.json({ status: false, message: "Not working Email and AppPassword" });
            } else {
                console.log('Email sent: ' + info.response);
                try {
                    const saveApppassword = new Appdb({
                        Appemail: Appemail,
                        AppPassword: AppPassword,
                        username:tempusername,
                        email:tempemail,
                        password:temppassword,
                        
                    });
                    await saveApppassword.save();
                    return res.json({ status: true, message: "Working App password" });
                } catch (err) {
                    console.log(err);
                    return res.json({ status: false, message: "Error saving to database" });
                }
            }
        });
    } catch (err) {
        console.log(err);
        return res.status(500).json({ status: false, message: "Internal Server Error" });
    }
});

export {router as UserRouter}
