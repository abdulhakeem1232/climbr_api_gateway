import express, { Request, Response, NextFunction } from "express";
import { UserController } from "./controller";
import { profileController } from "./ProfileController";
import authMiddleware from "../../../middleware/auth";
import multer from "multer";

const userRoute = express.Router();
const storage = multer.memoryStorage()
const upload = multer({ storage: storage })


userRoute.use(express.json());

userRoute.post("/register", UserController.register);
userRoute.post("/verifyOtp", UserController.otp);
userRoute.post('/login', UserController.login);
userRoute.post('/google-login', UserController.loginwithgoogle)
userRoute.post('/emailValidate', UserController.emailValidate)
userRoute.post('/resetPassword', UserController.resetPassword)
userRoute.post('/resendOtp', UserController.resendOtp)
userRoute.get('/logout', UserController.logout)
userRoute.get('/getStatus', UserController.getStatus)
userRoute.get('/getUserDetails/:id', authMiddleware, UserController.getDetails)
userRoute.put('/updateCover/:id', authMiddleware, upload.single("image"), profileController.coverPhoto)
userRoute.put('/updateProfile/:id', authMiddleware, upload.single("image"), profileController.profilePhoto)
userRoute.put('/updateData/:id', authMiddleware, profileController.profileData)
userRoute.put('/updateEducation/:id', authMiddleware, profileController.educationData)
userRoute.put('/updateExperience/:id', authMiddleware, profileController.experiencenData)
userRoute.put('/updateSkills/:id', authMiddleware, profileController.skillsData)
userRoute.get('/getFollowings/:id', authMiddleware, profileController.getFollowings)
userRoute.get('/follow/:userId/:guestId', authMiddleware, profileController.follow)
userRoute.get('/unfollow/:userId/:guestId', authMiddleware, profileController.unfollow)
userRoute.get('/SearchUser', authMiddleware, profileController.searchUser)
userRoute.get('/suggestion/:userId', authMiddleware, profileController.suggestion)
userRoute.get('/getSkills', authMiddleware, profileController.getSkills)















export default userRoute;

