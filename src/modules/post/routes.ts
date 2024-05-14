import express from "express";
import { PostController } from "./controller";
import multer from 'multer'


const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

const postRoute = express.Router();

postRoute.use(express.json());

postRoute.post('/createpost', upload.single("image"), PostController.post);
postRoute.get('/getall', PostController.getallpost)



export default postRoute;
