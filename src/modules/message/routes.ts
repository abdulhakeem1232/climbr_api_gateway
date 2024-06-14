import express from "express";
import { messageController } from "./messageController";
import authMiddleware from "../../../middleware/auth";
import multer from "multer";

const storage = multer.memoryStorage()
const upload = multer({ storage: storage })

const messageRoute = express.Router();

messageRoute.use(express.json());

messageRoute.get('/createchats/:userId/:guestId', authMiddleware, messageController.createChats);
messageRoute.get('/getchatlist/:userId', authMiddleware, messageController.getChatsList);
messageRoute.get('/getMessages/:chatId', authMiddleware, messageController.getMessages);
messageRoute.post('/sendFiles', authMiddleware, upload.single("file"), messageController.sendMessages);









export default messageRoute
