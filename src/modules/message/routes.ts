import express from "express";
import { messageController } from "./messageController";
import authMiddleware from "../../../middleware/auth";


const messageRoute = express.Router();

messageRoute.use(express.json());











export default messageRoute
