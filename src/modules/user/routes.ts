import express from "express";
import { UserController } from "./controller";

const userRoute = express.Router();

userRoute.use(express.json());

userRoute.post("/register", UserController.register);
userRoute.post("/verifyOtp", UserController.otp);
userRoute.post('/login',UserController.login)
userRoute.post('/google-login',UserController.loginwithgoogle)



export default userRoute;

