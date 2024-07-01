import express from "express";
import authMiddleware from "../../../middleware/auth";
import { adminController } from "./controller";

const adminRoute = express.Router();

adminRoute.use(express.json());

adminRoute.get('/getalluser', authMiddleware, adminController.getallUser)
adminRoute.put('/updateUserStatus', authMiddleware, adminController.updateStatus)
adminRoute.get('/getallrecruiter', authMiddleware, adminController.getallrecruiter)
adminRoute.put('/updateRecruiterStatus', authMiddleware, adminController.updateStatusRecruiter)
adminRoute.put('/approve', authMiddleware, adminController.updateApproval)
adminRoute.get('/reportedpost', authMiddleware, adminController.reportedpost)
adminRoute.delete('/post/:postId', authMiddleware, adminController.deletepost)
adminRoute.get('/userReport', authMiddleware, adminController.getUserReport)
adminRoute.get('/recruiterReport', authMiddleware, adminController.getRecruiterReport)
adminRoute.get('/postReport', authMiddleware, adminController.getPostReport)
adminRoute.get('/jobReport', authMiddleware, adminController.getJobReport)



export default adminRoute
