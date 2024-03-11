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
var sessiontokenz;

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
            subject: 'Reset Bhai amazing work',
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

// const verifyUser = async (req, res, next) => {
//     try {
//         const token = req.cookies.token;
//         if (!token) {
//             return res.json({ status: false, message: "no token" });
//         }
//         const decoded = await jwt.verify(token, process.env.KEY);
//         next()

//     } catch (err) {
//         return res.json(err);
//     }
// };


router.post('/ChetakMail', async (req,res)=>{
    const { emails,textmsg,subject,htmlFile,name} = req.body;
    console.log(emails,textmsg,subject,htmlFile) 
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
      return res.json({status:false, error: 'Failed to send emails' });
    }
  });
// router.post('/logout', (req, res) => {
//     // Destroy the session
//     req.session.destroy(err => {
//       if (err) {
//         console.error('Error destroying session:', err);
//         return res.status(500).json({ status: false, message: 'Failed to logout' });
//       }
//       // Send a response indicating successful logout
//       return res.json({ status: true, message: 'Logout successful' });
//     });
//   });
router.post('/logout', async (req, res) => {
    const newToken = jwt.sign({ username: sessionusername }, process.env.KEY_session, { expiresIn: '1s' });
    res.cookie('token', newToken, { httpOnly: true });
    sessionusername = null;
    return res.json({ status: true, message: 'Logged out' });
  });
// router.get('/Dashboard',(req,res)=>{
//     if(req.session.username){
//         return res.json({valid:true ,username:req.session.username})
//     }
//     else {
//         return res.json({valid :false})
//     }
// })
router.get('/Dashboard', async (req, res) => {
    const token = req.cookies.token;
  
    if (!token) {
      return res.json({ valid: false, message: "No token" });
    }
  
    try {
      const decoded = jwt.verify(token, process.env.KEY_session);
      console.log(" inside decode", decoded);
  
      if(decoded.username === sessionusername) {
        return res.json({ valid: true, username: decoded.username });
      } else {
        return res.json({ valid: false, message: "Invalid token" });
      }
    } catch (error) {
      console.error('Error while verifying token:', error);
  
      // If the token is expired, shorten the expiration time and send a new token
      if (error.name === 'TokenExpiredError') {
        const newToken = jwt.sign({ username: sessionusername }, process.env.KEY_session, { expiresIn: '1s' });
        res.cookie('token', newToken, { httpOnly: true });
        return res.json({ valid: false, message: "Token expired", newToken });
      }
  
      return res.json({ valid: false, message: "Invalid token" });
    }
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
          username,
          email,
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
    const { email, password } = req.body;
  
    // Find the user by email
    const user = await Appdb.findOne({ email });
    if (!user) {
      return res.json({ status: false, message: 'Invalid email' });
    }
  
    // Compare the provided password with the stored hash
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.json({ status: false, message: 'Invalid  password' });
    }
  
    // Generate a JWT token
    const token = jwt.sign({ id: user._id }, process.env.KEY, { expiresIn: '1h' });
  
    // Set the token cookie
    res.cookie('token', token, { httpOnly: true });
  
    // Return a success response
    return res.json({ status: true, message: 'Logged in successfully' });
  });
// router.post('/Login' , async (req,res)=>{
//     const{Email,password}=req.body;
  
//     console.log(password,Email)
  
//     const emailmatch = await Appdb.findOne({ email: Email });
//     console.log(emailmatch)
//     if(emailmatch==null){
//         return res.json({status:false,message:"Email not found"})
//     }
//     const passwordMatch = await bcrypt.compare(password, emailmatch.password);
//     if (passwordMatch){
//         console.log("Password comparison result: true");
//         // req.session.username = emailmatch.username
//         // console.log(req.session.username)
//         sessionusername = emailmatch.username;
//         sessiontokenz =  await jwt.sign({ username: emailmatch.username }, process.env.KEY_session, { expiresIn: '2h' });
//         console.log("jwtsessiontoken create",sessiontokenz,sessionusername)
//         res.cookie('token', sessiontokenz, { httpOnly: true }); // Set the JWT token as an HTTP-only cookie
//         return res.json({status:true,message:" successfully login"})
//     } else {
//         console.log("Password comparison result: false");
//         return res.json({status:false,message:" Enter Password correctly login "})
//     }
//   })

// router.post('/Login' , async (req,res)=>{
    
// const{Email,password}=req.body;


// console.log(password,Email)

// const emailmatch = await Appdb.findOne({ email: Email });
// console.log(emailmatch)
// if(emailmatch==null){
//     return res.json({status:false,message:"Email not found"})
// }
// const passwordMatch = await bcrypt.compare(password, emailmatch.password);
// if (passwordMatch){
//     console.log("Password comparison result: true");
//     req.session.username = emailmatch.username
//     console.log(req.session.username)
//     sessionusername=emailmatch.username
//     return res.json({status:true,message:" successfully login"})
// } else {
//     console.log("Password comparison result: false");
//     return res.json({status:false,message:" Enter Password correctly login "})
// }

// })

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