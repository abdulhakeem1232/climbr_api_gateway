import express, { Request, Response, NextFunction } from "express";
import { MessageClient } from "./config/grpcClient/messageClient";
import { UserClient } from "../user/config/grpcClient/userClient";
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import crypto from 'crypto'

const randomImageName = (bytes = 32) => crypto.randomBytes(bytes).toString('hex')
const access_key = process.env.ACCESS_KEY
const secret_access_key = process.env.SECRET_ACCESS_KEY
const bucket_region = process.env.BUCKET_REGION
const bucket_name = process.env.BUCKET_NAME

const s3: S3Client = new S3Client({
    credentials: {
        accessKeyId: access_key || '',
        secretAccessKey: secret_access_key || ''
    },
    region: process.env.BUCKET_REGION
});

export const messageController = {

    createChats: (req: Request, res: Response, next: NextFunction) => {
        try {
            const { userId, guestId } = req.params
            MessageClient.CreateChat({ userId, guestId }, (err: Error | null, result: any) => {
                if (err) {
                    console.error("Error: ", err);
                    return res.status(500).json({ error: 'Internal Server Error' });
                }
                return res.json(result);
            });
        } catch (error) {
            console.error("Error during delete comment post:", error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    },

    getChatsList: (req: Request, res: Response, next: NextFunction) => {
        try {
            const { userId } = req.params
            MessageClient.getChatsList({ userId }, async (err: Error | null, result: any) => {
                if (err) {
                    console.error("Error: ", err);
                    return res.status(500).json({ error: 'Internal Server Error' });
                }
                const filteredChats = result.chatlist.map((chat: any) => {
                    const otherParticipant = chat.participants.find((participant: string) => participant !== userId);
                    return { _id: chat._id, otherParticipant };
                });

                const userData = await Promise.all(
                    filteredChats.map((otherParticipant: any) => {
                        return new Promise((resolve, reject) => {
                            console.log(otherParticipant, '-------');

                            UserClient.GetUserData({ userId: otherParticipant.otherParticipant }, (err: Error | null, user: any) => {
                                if (err) {
                                    console.error("Error fetching user data: ", err);
                                    reject(err);
                                } else {
                                    resolve(user);
                                }
                            });
                        });
                    })
                );
                const response = filteredChats.map((chat: any, index: number) => ({
                    _id: chat._id,
                    user: userData[index]
                }));
                return res.json(response);
            });
        } catch (error) {
            console.error("Error during getting chat list:", error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    },

    getMessages: (req: Request, res: Response, next: NextFunction) => {
        try {
            const { chatId } = req.params
            MessageClient.getMessages({ chatId }, (err: Error | null, result: any) => {
                if (err) {
                    console.error("Error: ", err);
                    return res.status(500).json({ error: 'Internal Server Error' });
                }
                return res.json(result);
            });
        } catch (error) {
            console.error("Error during getting message:", error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    },
    sendMessages: async (req: Request, res: Response, next: NextFunction) => {
        try {
            console.log(req.body, req.file);
            const name = randomImageName()
            const params = {
                Bucket: bucket_name,
                Key: name,
                Body: req.file?.buffer,
                ContetType: req.file?.mimetype,
            }
            const command = new PutObjectCommand(params)
            await s3.send(command);
            const fileType = req.file?.mimetype;
            const filePath = name;
            console.log('stored in s3');
            return res.json({ fileType, filePath });
        } catch (error) {
            console.error("Error during sending message:", error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    },
}


