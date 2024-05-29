import express from "express";
import { recruiterController } from "./recruiterController";
import authMiddleware from "../../../middleware/auth";

const recruiterRoute = express.Router();

recruiterRoute.use(express.json());

recruiterRoute.post('/register', recruiterController.register);
recruiterRoute.post("/verifyOtp", recruiterController.otp);
recruiterRoute.post('/login', recruiterController.login);





export default recruiterRoute
