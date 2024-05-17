import express, { Request, Response, NextFunction } from "express";
import { PostClient } from "./config/grpcClient/postClient";
import { UserClient } from "../user/config/grpcClient/userClient";
import * as dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();

interface JwtPayload {
    email: string;
    userId: string;

}

export const PostController = {
    post: (req: Request, res: Response, next: NextFunction) => {
        console.log('Body:post service', req.body);
        const { description } = req.body;
        console.log('File:', req.file);
        console.log('buffer', req.file?.buffer);
        const token = req.cookies.token
        console.log(token);
        let email, userId
        if (process.env.SECRET_KEY) {
            const decoded = jwt.verify(token, process.env.SECRET_KEY) as JwtPayload;
            email = decoded.email;
            userId = decoded.userId
            console.log(decoded, 'decodeds');
        }
        console.log(email, 'email');
        const buffer = req.file?.buffer
        const fileDetails = {
            originalname: req.file?.originalname,
            encoding: req.file?.encoding,
            mimetype: req.file?.mimetype,
            buffer: req.file?.buffer,
            size: req.file?.size
        }
        console.log(description, userId, fileDetails, '-----');

        PostClient.CreatePost({ image: fileDetails, userId: userId, description: description }, (err: Error | null, result: any) => {
            if (err) {
                console.error("Error: ", err);
                return res.status(500).json({ error: 'Internal Server Error' });
            }
            console.log("Response from postclient for creating post:", result);
            return res.json(result);
        });
    },
    getallpost: (req: Request, res: Response, next: NextFunction) => {
        const { page = 1, limit = 10 } = req.query;
        console.log('-0-0-0-0-0', page, limit);

        PostClient.GetAllPost({ page: page, limit: limit }, async (err: Error | null, result: any) => {
            if (err) {
                console.error("Error: ", err);
                return res.status(500).json({ error: 'Internal Server Error' });
            }
            console.log("Response from postclient for retrive post:", result);
            if (!Array.isArray(result.posts) || result.posts.length === 0) {
                console.log('No posts retrieved from GetAllPost RPC');
                return res.json({ posts: [] });
            }
            const userIds = result.posts.map((post: any) => post.userId);
            try {
                const userData = await Promise.all(
                    userIds.map((userId: string) => {
                        return new Promise((resolve, reject) => {
                            UserClient.GetUserData({ userId: userId }, (err: Error | null, user: any) => {
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

                result.posts.forEach((post: any, index: number) => {
                    post.userData = userData[index];
                });

                console.log("Response from postclient for getting all posts:", result);
                console.log(result.posts[0].userData);


                return res.json(result);
            } catch (error) {
                console.error("Error fetching user data: ", error);
                return res.status(500).json({ error: 'Internal Server Error' });
            }
        });
    },
}
