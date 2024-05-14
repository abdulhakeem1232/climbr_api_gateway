    import express from "express";
    import { recruiterController } from "./recruiterController";

    const recruiterRoute = express.Router();
    
    recruiterRoute.use(express.json());

    recruiterRoute.post('/register',recruiterController.register);
    recruiterRoute.post("/verifyOtp", recruiterController.otp);
    recruiterRoute.post('/login',recruiterController.login)
    recruiterRoute.get('/getallrecruiter',recruiterController.getall)
    recruiterRoute.put('/updateStatus',recruiterController.updateStatus)
    recruiterRoute.put('/approve',recruiterController.updateApproval)
    




    export default recruiterRoute
