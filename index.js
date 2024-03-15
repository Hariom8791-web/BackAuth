// import express from 'express'
// import dotenv from 'dotenv'
// import mongoose from 'mongoose'
// import cors from 'cors'
// import cookieParser from 'cookie-parser';
// import session from 'express-session';
// import bodyParser from 'body-parser';
// dotenv.config()
// import { UserRouter } from './routes/user.js'

// const app=express()
// app.use(bodyParser.json())
// app.use(cookieParser())

// app.use(express.urlencoded({ extended: true }));
// app.use(express.json());
// app.use(bodyParser.json());
// app.use((req, res, next) => {
//     res.setHeader('Access-Control-Allow-Origin', 'https://front-auth-mu.vercel.app');
//     res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
//     res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
//     res.setHeader('Access-Control-Allow-Credentials', 'true');
//     next();
//   });
// app.use(cors({
//     //front end jaha host ho rha h / nhi ayega
//     origin:["https://front-auth-mu.vercel.app"],
//     method :["POST","GET"],
//     credentials:true,
// }))

// app.get('/',(req,res)=>{
//      res.json('hello ')
// })
// app.use('/auth',UserRouter)
// app.listen(process.env.PORT,()=>{
//     console.log("server is running")
// })
// //mongoose.connect('mongodb+srv://hariomsingh4274:FJFZiGBqhAZRv3SR@cluster0.vlrs0o5.mongodb.net/Base?retryWrites=true&w=majority&appName=Cluster0')


// mongoose.connect('mongodb://localhost:27017/Base2')



// //gsdfgs
// // import express from 'express'
// // import dotenv from 'dotenv'
// // import mongoose from 'mongoose'
// // import cors from 'cors'
// // import cookieParser from 'cookie-parser';
// // import session from 'express-session';
// // import bodyParser from 'body-parser';
// // dotenv.config()
// // import { UserRouter } from './routes/user.js'

// // const app=express()
// // app.use(bodyParser.json())
// // app.use(cookieParser())

// // app.use(express.urlencoded({ extended: true }));
// // app.use(express.json());
// // app.use(bodyParser.json());
// // app.use(cors({
// //     //front end jaha host ho rha h / nhi ayega
// //     origin:["https://front-auth-mu.vercel.app"],
// //     method :["POST","GET"],
// //     credentials:true,
// // }))
// // // app.options('https://front-auth-mu.vercel.app', cors());
// // app.get('/',(req,res)=>{
// //      res.json('hello ')
// // })
// // app.use('/auth',UserRouter)
// // app.listen(process.env.PORT,()=>{
// //     console.log("server is running")
// // })
// // //mongoose.connect('mongodb+srv://hariomsingh4274:FJFZiGBqhAZRv3SR@cluster0.vlrs0o5.mongodb.net/Base?retryWrites=true&w=majority&appName=Cluster0')


// // mongoose.connect('mongodb://localhost:27017/Base2')

import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { UserRouter } from './routes/user.js';

dotenv.config();

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// app.use(cors({
//     origin: ["https://front-auth-mu.vercel.app"],
//     methods: ["POST", "GET"],
//     credentials: true,
//     optionSuccessStatus:200
// }));
// app.use(cors(corsOptions));
const corsOrigin ={
    origin:['https://front-auth-mu.vercel.app','https://gulal-revolution.vercel.app'],
     //or whatever port your frontend is using
    credentials:true,
    methods: ["POST", "GET"],     
    allowedHeaders: ['Content-Type', 'Authorization'],       
    optionSuccessStatus:200,
}
app.use(cors(corsOrigin));
app.get('/', (req, res) => {
    res.json('hello');
});

app.use('/auth', UserRouter);

app.listen(process.env.PORT, () => {
    console.log("server is running");
});

mongoose.connect('mongodb+srv://hariomsingh4274:FJFZiGBqhAZRv3SR@cluster0.vlrs0o5.mongodb.net/Base?retryWrites=true&w=majority&appName=Cluster0')
