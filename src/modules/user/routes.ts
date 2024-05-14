import express, { Request, Response, NextFunction } from "express";
import { UserController } from "./controller";

const userRoute = express.Router();



userRoute.use(express.json());

userRoute.post("/register", UserController.register);
userRoute.post("/verifyOtp", UserController.otp);
userRoute.post('/login', UserController.login);
userRoute.post('/google-login', UserController.loginwithgoogle)
userRoute.get('/getalluser', UserController.getall)
userRoute.put('/updateStatus', UserController.updateStatus)
userRoute.post('/emailValidate', UserController.emailValidate)
userRoute.post('/resetPassword', UserController.resetPassword)
userRoute.post('/resendOtp', UserController.resendOtp)


export default userRoute;

