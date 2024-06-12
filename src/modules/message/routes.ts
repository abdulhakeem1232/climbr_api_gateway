import express from "express";
import { messageController } from "./messageController";
import authMiddleware from "../../../middleware/auth";


const messageRoute = express.Router();

messageRoute.use(express.json());

messageRoute.get('/createchats/:userId/:guestId', authMiddleware, messageController.createChats);
messageRoute.get('/getchatlist/:userId', authMiddleware, messageController.getChatsList);
messageRoute.get('/getMessages/:chatId', authMiddleware, messageController.getMessages);










export default messageRoute
