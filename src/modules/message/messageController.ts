import express, { Request, Response, NextFunction } from "express";
import { MessageClient } from "./config/grpcClient/messageClient";
import { UserClient } from "../user/config/grpcClient/userClient";


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
}


