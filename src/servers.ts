import dotenv from "dotenv";
import express, { Request, Response, Express } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRoute from "./modules/user/routes";

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

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});


