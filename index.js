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

const corsOptions = {
    origin: 'https://front-auth-mu.vercel.app', // Replace this with your frontend URL
    credentials: true ,
    allowedHeaders: ['Content-Type', 'Authorization'],
    exposedHeaders: ['Authorization'],
    optionSuccessStatus: 200,
};

app.use(cors(corsOptions));


app.get('/', (req, res) => {
    res.json('hello');
});

app.use('/auth', UserRouter);

app.listen(process.env.PORT, () => {
    console.log("Server is running");
});

mongoose.connect('mongodb://localhost:27017/Base2');
