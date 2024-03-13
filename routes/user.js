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
var token ;
router.get('/',(req,res)=>{
    res.json("Hello")
})

router.get('/getusername',async(req,res)=>{
    return res.json({status:true,sessionusername:sessionusername})
})

router.post('/Forgotpassword', async (req, res) => {
    const { email } = req.body
    console.log(email)
    try {
        const user = await Appdb.findOne({ email:email })
        if (!user) {
            console.log("usernot found in appdb",user)
            return res.json({ status:false,message: "User  not registered Kindly Register Yourself" })
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
                
                return res.json({ message: "email not  sent" })
            } else {
                
                return res.json({ status: true, message: "email sent" })
            }
        });
    }

    catch (err) {
        console.log(err)
        return res.json({status:false ,message:"There is an Issue kindly Try later!"})

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
        return res.json({ status: true, message: "Updated password" });
    } catch (err) {
        return res.json({status:false ,message:"Invalid token"});
    }
});
router.post('/ChetakMail', async (req, res) => {
    try {
        const { emails, textmsg, subject, htmlFile, name } = req.body;
        console.log(emails, textmsg, subject, htmlFile, name);
        const Numberofemails = emails.length;
        if (Numberofemails > 100) {
            return res.json({ status: false, message: "Can't send Emails more than 200 At a time Reduce Your list Under 100" });
        }
        console.log("Number of emails ", Numberofemails);
        const doc = await Appdb.findOne({ username: name });
        const appemail = await doc.Appemail;
        const apppassword = await doc.AppPassword;
        console.log(appemail, apppassword);
        
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: `${appemail}`,
                pass: `${apppassword}`
            }
        });

        const emailPromises = emails.map(async (email) => {
            const savesentmail = new Sentmaildb({
                sentemail: email,
                byuser: sessionusername,
            });
            await savesentmail.save();
            try {
                await transporter.sendMail({
                    from: `${appemail}`,
                    to: email,
                    subject: `${subject}`,
                    html: htmlFile || undefined, // If htmlFile is not provided, send as text
                    text: htmlFile ? undefined : `${textmsg}`, // If htmlFile is provided, textmsg is ignored
                });
                console.log('Email sent to', email);
            } catch (error) {
                console.error('Error sending email to', email, ':', error);
                throw error; // Rethrow error to handle at a higher level
            }
        });

        await Promise.all(emailPromises);

        console.log('All emails sent successfully');
        return res.json({ status: true, message: 'Emails sent successfully' });
    } catch (error) {
        console.error('Unexpected Error:', error);
        return res.status(500).json({ status: false, message: 'Internal Server Error' });
    }
});

// router.post('/ChetakMail', async (req,res)=>{
//     try{

//     const { emails,textmsg,subject,htmlFile,name} = req.body;
//     console.log(emails,textmsg,subject,htmlFile,name )
//     const Numberofemails=emails.length;
//     if (Numberofemails >  100){
//         return res.json({status:false , message :"Can,t send Emails more than 200 At a time Reduce You list Under 100"})
//      }
//      console.log("Number of emails ",Numberofemails)
//     const doc = await Appdb.findOne({ username:name });
//     const appemail = await doc.Appemail;
//     const apppassword = await doc.AppPassword;
//     console.log(appemail,apppassword)
//     if(htmlFile){
//     for(let j=0;j<emails.length-1;j++){
//         const currentemail=emails[j]
//         console.log("currentemail/sessionusername",currentemail,sessionusername)
//             const savesentmail=new Sentmaildb({
//                 sentemail:currentemail,
//                 byuser:sessionusername,
                

//             })
//             await savesentmail.save()
//     }
    

//     try {
//       const transporter = nodemailer.createTransport({
//         // configure your email service
//         service: 'Gmail',
//         auth: {
//           user: `${appemail}`,
//           pass: `${apppassword}` 
//         }
//       });
      
//       for (let i=0; i<emails.length-1; i++) {
//         let email= emails[i]
       
       
//       await   transporter.sendMail({
//           from: `${appemail}`,
//           to: email,
//           subject: `${subject}`,
//           html:htmlFile
          

//       });
//       console.log('Emails sending',i);
//       }
//       console.log('Emails sent successfully');
      
//       return res.json({ status: true, message: 'Emails final successfully'});
//     } catch (error) {
//       console.error('Error sending emails:', error);
//       return res.json({status:true, error: 'Email sent successfully' });
//     }}

// //body sending

//     else{
//         for(let j=0;j<emails.length-1;j++){
//             const currentemail=emails[j]
            
//                 const savesentmail=new Sentmaildb({
//                     sentemail:currentemail,
//                     byuser:sessionusername,
                    
    
//                 })
//                 await savesentmail.save()
//         }
    
//         try {
//           const transporter = nodemailer.createTransport({
//             // configure your email service
//             service: 'Gmail',
//             auth: {
//               user: `${appemail}`,
//               pass: `${apppassword}` 
//             }
//           });
//           for (let i=0; i<emails.length-1; i++) {
//             let email= emails[i]
           
            
//           await   transporter.sendMail({
//               from: `${appemail}`,
//               to: email,
//               subject: `${subject}`,
//              text:`${textmsg}`

//           });
//            console.log('Emails sending',i);
//           }
//           console.log('Emails sent successfully');

//           return res.json({ status: true, message: 'Emails final successfully'});
//         } catch (error) {
//           console.error('Error sending emails:', error);
//           return res.json({status:true, error: 'Email sent successfully' });
//         }




//     }}
//     catch(error){
//         return res.json({status :false ,message:"Unexpected Error"})
//     }
//   });

router.get('/dashboard',async (req, res) => {
   try{
    const decoded= await jwt.verify(sessiontokenz, process.env.JWT_SECRET)
    
    if (!sessiontokenz === token || decoded.exp - Date.now()/1000 < 5) {
        
        sessionusername=null;
        token =null;
        return res.json({ status:false ,message: "Tok",sessiontokenz:sessiontokenz,token:token });
    }

    if (!sessiontokenz) {
        return res.json({ status: false, message: "session expired" });
    }
    
    if(decoded.username==sessionusername){
        res.json({ status: true, message: "Token is valid", username: decoded.username, Appemail: decoded.Appemail });
    }
    else {
        res.json({status :false  ,message :"Toke is out Dated"})
    }
}catch(error){
    return res.json({status:false,message:"You are logout >>Session Over!"})
}
});

router.post('/logout', (req, res) => {
    // Invalidate the token by not sending any response, or you can return a success message if needed
    sessiontokenz=null;
    sessionusername=null;
    token=null;
    res.json({ status: true, message: "Logout successful" });
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
               
                return res.json({status:false, message: "Otp not  sent" })
            } else {
               
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
        const saveApppassword = new Appdb({
            // Appemail: Appemail,
            // AppPassword: AppPassword,
            username:tempusername,
            email:tempemail,
            password:temppassword,
            
        });
        await saveApppassword.save();
        return res.json({ status: true, message: "OTP matched" });

        
    } else {
        
        return res.json({ status: false, message: "OTP not match" });

    }

}) 

router.post('/login', async (req, res) => {
    const { Email, password } = req.body;

    try {
        const user = await Appdb.findOne({ email: Email });

        if (!user) {
            return res.json({ status: false, message: "Email not found" });
        }
        sessionusername= user.username
        
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (passwordMatch) {
             token = await  jwt.sign({
                username: user.username,
                Appemail: user.Appemail,
                Apppassword: user.AppPassword
            }, process.env.JWT_SECRET, { expiresIn: '2h' });
            sessiontokenz=token;
            
            return res.json({ status: true, message: "Successfully logged in"});
        } else {
            return res.json({ status: false, message: "Incorrect password" });
        }
    } catch (error) {
        console.error('Login error:', error);
        return res.json({ status: false, message: "Internal Server Error" });
    }
});



router.post('/AppPasssword', async (req, res) => {
    const { Appemail, AppPassword ,username} = req.body;
    const Appemailfounded= await Appdb.findOne({Appemail:Appemail})

    console.log(Appemail, AppPassword);
    console.log("username",username)
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
                    
                    await Appdb.updateOne({ username: username }, { Appemail: Appemail });
                    await Appdb.updateOne({ username: username }, { AppPassword: AppPassword});
                    console.log("saving data")
                    
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
