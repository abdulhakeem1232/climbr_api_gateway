// src/index.ts
import dotenv from "dotenv";
import express, { Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRoute from "./modules/user/routes";
import recruiterRoute from "./modules/recruiter/routes";
import postRoute from "./modules/post/routes";
import jobRoute from "./modules/jobPost/routes";
import adminRoute from "./modules/admin/routes";
import messageRoute from "./modules/message/routes";
import { createServer } from "http";
import setupSocket from "./socket/socket";
import logger from 'morgan'

dotenv.config();

const app: Express = express();
const port = process.env.PORT;

app.use(cookieParser());
// app.use(cors({
//   origin: 'http://localhost:3000',
//   credentials: true
// }));

const allowedOrigins = ['https://climbr.site'];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, origin);
    } else {
      callback(null, '*');
    }
  },
  credentials: true,  
  methods: ['GET', 'POST', 'OPTIONS', 'DELETE', 'PUT', 'PATCH'],
}));


// app.use(cors({
//   origin: 'https://climbr.site',
//   credentials: true
// }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(logger('dev'))
app.use("/", userRoute);
app.use("/recruiter/job", jobRoute)
app.use("/recruiter", recruiterRoute);
app.use('/admin', adminRoute)
app.use("/post", postRoute);
app.use("/job", jobRoute);
app.use("/message", messageRoute);

const server = createServer(app);
setupSocket(server).then(io => {
  console.log('Socket.io is set up.');
});

console.log(`NODE_ENV: ${process.env.NODE_ENV}`);
console.log(`Message Service Domain: ${process.env.PRO_DOMAIN_MESSAGE}`);
console.log(`Message Service Port: ${process.env.MESSAGE_PORT}`);
console.log(`Message Service Domain: ${process.env.PRO_DOMAIN_JOB}`);
console.log(`Message Service Port: ${process.env.JOB_PORT}`);
console.log(`Message Service Domain: ${process.env.PRO_DOMAIN_USER}`);
console.log(`Message Service Port: ${process.env.USER_PORT}`);

server.listen(port, () => {
  console.log(`Server is running on after success http://localhost:8080`);
});

