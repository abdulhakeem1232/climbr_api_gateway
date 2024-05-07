    import express from "express";
    import { recruiterController } from "./recruiterController";

    const recruiterRoute = express.Router();
    
    recruiterRoute.use(express.json());

    recruiterRoute.post('/register',recruiterController.register);
    recruiterRoute.post("/verifyOtp", recruiterController.otp);
    recruiterRoute.post('/login',recruiterController.login)


    export default recruiterRoute
