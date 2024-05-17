import express from "express";
import { recruiterController } from "./recruiterController";
import authMiddleware from "../../../middleware/auth";

const recruiterRoute = express.Router();

recruiterRoute.use(express.json());

recruiterRoute.post('/register', recruiterController.register);
recruiterRoute.post("/verifyOtp", recruiterController.otp);
recruiterRoute.post('/login', recruiterController.login)
recruiterRoute.get('/getallrecruiter', authMiddleware, recruiterController.getall)
recruiterRoute.put('/updateStatus', authMiddleware, recruiterController.updateStatus)
recruiterRoute.put('/approve', recruiterController.updateApproval)





export default recruiterRoute
