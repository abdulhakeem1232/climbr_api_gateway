import express, { Request, Response, NextFunction } from "express";
import { UserController } from "./controller";
import authMiddleware from "../../../middleware/auth";

const userRoute = express.Router();



userRoute.use(express.json());

userRoute.post("/register", UserController.register);
userRoute.post("/verifyOtp", UserController.otp);
userRoute.post('/login', UserController.login);
userRoute.post('/google-login', UserController.loginwithgoogle)
userRoute.get('/getalluser', authMiddleware, UserController.getall)
userRoute.put('/updateStatus', authMiddleware, UserController.updateStatus)
userRoute.post('/emailValidate', UserController.emailValidate)
userRoute.post('/resetPassword', UserController.resetPassword)
userRoute.post('/resendOtp', UserController.resendOtp)
userRoute.get('/logout', UserController.logout)


export default userRoute;

