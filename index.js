import express from 'express'
import dotenv from 'dotenv'
import mongoose from 'mongoose'
import cors from 'cors'
import cookieParser from 'cookie-parser';
import session from 'express-session';
import bodyParser from 'body-parser';
dotenv.config()
import { UserRouter } from './routes/user.js'

const app=express()
app.use(bodyParser.json())
app.use(cookieParser())

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(bodyParser.json());
app.use(cors({
    //front end jaha host ho rha h / nhi ayega
    origin:["https://front-auth-mu.vercel.app"],
    method :["POST","GET"],
    credentials:true,
}))
app.use('/auth',UserRouter)
app.listen(process.env.PORT,()=>{
    console.log("server is running")
})
mongoose.connect('mongodb+srv://hariomsingh4274:FJFZiGBqhAZRv3SR@cluster0.vlrs0o5.mongodb.net/Base?retryWrites=true&w=majority&appName=Cluster0')


//mongoose.connect('mongodb://localhost:27017/Base')

