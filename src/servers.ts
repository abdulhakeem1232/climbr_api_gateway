import dotenv from "dotenv";
import express, { Request, Response, Express, NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRoute from "./modules/user/routes";
import recruiterRoute from "./modules/recruiter/routes";
import postRoute from "./modules/post/routes";
import jobRoute from "./modules/jobPost/routes";
import adminRoute from "./modules/admin/routes";
import messageRoute from "./modules/message/routes";
import { createServer } from "http";
import { Server } from 'socket.io'
dotenv.config();

const app: Express = express();
const port = process.env.PORT;

app.use(cookieParser());
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/", userRoute);
app.use("/recruiter/job", jobRoute)
app.use("/recruiter", recruiterRoute);
app.use('/admin', adminRoute)
app.use("/post", postRoute);
app.use("/job", jobRoute);
app.use("/message", messageRoute)

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST']
  }
});

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  socket.on("sendMessage", (data) => {
    console.log("Message received:", data);
    io.emit("message", { name: data.name, message: data.message });
  });

  socket.on("disconnect", () => {
    console.log('user Disconnected');
  });
});

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
