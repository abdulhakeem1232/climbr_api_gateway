import dotenv from "dotenv";
import express, { Request, Response, Express, NextFunction } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRoute from "./modules/user/routes";
import recruiterRoute from "./modules/recruiter/routes";
import postRoute from "./modules/post/routes";
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
app.use("/recruiter", recruiterRoute);
app.use("/post", postRoute)



app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
