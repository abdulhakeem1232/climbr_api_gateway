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







export default jobRoute
