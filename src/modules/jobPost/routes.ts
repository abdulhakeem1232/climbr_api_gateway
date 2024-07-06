import express from "express";
import multer from 'multer'

import { jobController } from "./jobController";
import authMiddleware from "../../../middleware/auth";

const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

const jobRoute = express.Router();

jobRoute.use(express.json());

jobRoute.post('/createjob', authMiddleware, upload.single("companylogo"), jobController.createJob);
jobRoute.get('/getjob/:userId', authMiddleware, jobController.getJob);
jobRoute.get('/getalljob/', authMiddleware, jobController.getallJob);
jobRoute.get('/singlejob/:id', authMiddleware, jobController.getsingleJob);
jobRoute.post('/applyjob', authMiddleware, upload.single("cv"), jobController.applyJob);
jobRoute.delete('/deletejob', authMiddleware, jobController.deleteJob);
jobRoute.post('/updatejob', authMiddleware, jobController.updatejob);
jobRoute.post('/searchjob', authMiddleware, jobController.searchJob);
jobRoute.get('/applicantChart/:userId', authMiddleware, jobController.getApplicantsChart);
jobRoute.get('/getApplicant/:jobId', authMiddleware, jobController.getApplicants);
jobRoute.post('/applicantStatus', authMiddleware, jobController.updateStatus)












export default jobRoute
