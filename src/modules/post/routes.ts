import express from "express";
import { PostController } from "./controller";
import multer from 'multer'
import authMiddleware from "../../../middleware/auth";


const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

const postRoute = express.Router();

postRoute.use(express.json());

postRoute.post('/createpost', authMiddleware, upload.single("image"), PostController.post);
postRoute.get('/getall', authMiddleware, PostController.getallpost)



export default postRoute;
