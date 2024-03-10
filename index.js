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
app.use(session({
    secret : 'secret',
    resave:false,
    saveUninitialized:false,
    cookie:{    
        secure : false,
        maxAge : 1000 * 60 * 60 *24

    }


}))
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(bodyParser.json());
app.use(cors({
    //front end jaha host ho rha h / nhi ayega
    origin:["http://localhost:5173"],
    method :["POST","GET"],
    credentials:true,
}))
app.get('/', (req, res) => {
    res.json("Hello from the root!");
});

app.use('/auth',UserRouter)
const port = process.env.PORT || 3000; // Use process.env.PORT for dynamic port assigned by Vercel
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});


mongoose.connect('mongodb+srv://hariomsingh4274:FJFZiGBqhAZRv3SR@cluster0.vlrs0o5.mongodb.net/Base?retryWrites=true&w=majority&appName=Cluster0')
