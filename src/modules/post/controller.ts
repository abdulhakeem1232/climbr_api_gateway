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
        try {
            const { description } = req.body;
            const token = req.cookies.token
            console.log(token);
            let email, userId
            if (process.env.SECRET_KEY) {
                const decoded = jwt.verify(token, process.env.SECRET_KEY) as JwtPayload;
                email = decoded.email;
                userId = decoded.userId
            }
            const buffer = req.file?.buffer
            const fileDetails = {
                originalname: req.file?.originalname,
                encoding: req.file?.encoding,
                mimetype: req.file?.mimetype,
                buffer: req.file?.buffer,
                size: req.file?.size
            }
            PostClient.CreatePost({ image: fileDetails, userId: userId, description: description }, (err: Error | null, result: any) => {
                if (err) {
                    console.error("Error: ", err);
                    return res.status(500).json({ error: 'Internal Server Error' });
                }
                console.log("Response from postclient for creating post:", result);
                return res.json(result);
            });
        } catch (error) {
            console.error("Error during creatinbg post:", error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    },
    getallpost: (req: Request, res: Response, next: NextFunction) => {

        let { page, limit } = req.query;
        console.log('-0-0-0-0-0', page, limit);
        PostClient.GetAllPost({ page: page, limit: limit }, async (err: Error | null, result: any) => {
            if (err) {
                console.error("Error: ", err);
                return res.status(500).json({ error: 'Internal Server Error' });
            }
            if (!Array.isArray(result.posts) || result.posts.length === 0) {
                return res.json({ posts: [] });
            }
            const userIds = result.posts.map((post: any) => post.userId);
            const commentIds = result.posts.flatMap((post: any) =>
                post.comments?.map((comment: any) => comment.userId) || []
            )
            const allIds = [...new Set([...userIds, ...commentIds])];
            try {
                const userData = await Promise.all(
                    allIds.map((userId: string) => {
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
                    post.userData = userData.find((user: any) => user._id === post.userId);
                    if (post.comments) {
                        post.comments.forEach((comment: any) => {
                            comment.userData = userData.find((user: any) => user._id === comment.userId);
                        });
                    }
                });
                console.log(result, 'after update');

                return res.json(result);
            } catch (error) {
                console.log('errorhereeeee', error);

                return res.status(500).json({ error: 'Internal Server Error' });
            }
        });
    },
    like: (req: Request, res: Response, next: NextFunction) => {
        try {
            console.log('like--', req.body);
            const { userId, postId } = req.body
            PostClient.PostLike({ userId, postId }, (err: Error | null, result: any) => {
                if (err) {
                    console.error("Error: ", err);
                    return res.status(500).json({ error: 'Internal Server Error' });
                }
                console.log("Response from postclient for liking post:", result);
                return res.json(result);
            });
        } catch (error) {
            console.error("Error during liking post:", error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    },
    dislike: (req: Request, res: Response, next: NextFunction) => {
        try {
            console.log('like--', req.body);
            const { userId, postId } = req.body
            PostClient.PostDisLike({ userId, postId }, (err: Error | null, result: any) => {
                if (err) {
                    console.error("Error: ", err);
                    return res.status(500).json({ error: 'Internal Server Error' });
                }
                console.log("Response from postclient for dislike post:", result);
                return res.json(result);
            });
        } catch (error) {
            console.error("Error during disliking post:", error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    },
    comment: (req: Request, res: Response, next: NextFunction) => {
        try {
            console.log('comment--', req.body);
            const { userId, postId, comment } = req.body
            PostClient.PostComment({ userId, postId, comment }, (err: Error | null, result: any) => {
                if (err) {
                    console.error("Error: ", err);
                    return res.status(500).json({ error: 'Internal Server Error' });
                }
                console.log("Response from postclient for comment post:", result);
                return res.json(result);
            });
        } catch (error) {
            console.error("Error during commenting post:", error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    },
    deletComment: (req: Request, res: Response, next: NextFunction) => {
        try {
            console.log(req.body);

            const { postId, commentId } = req.body
            PostClient.DeleteComment({ postId, commentId }, (err: Error | null, result: any) => {
                if (err) {
                    console.error("Error: ", err);
                    return res.status(500).json({ error: 'Internal Server Error' });
                }
                console.log("Response from postclient for comment post:", result);
                return res.json(result);
            });
        } catch (error) {
            console.error("Error during delete comment post:", error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    },
    reportPost: (req: Request, res: Response, next: NextFunction) => {
        try {
            console.log(req.body);

            const { postId, reason, userId } = req.body
            PostClient.ReportPost({ postId, reason, userId }, (err: Error | null, result: any) => {
                if (err) {
                    console.error("Error: ", err);
                    return res.status(500).json({ error: 'Internal Server Error' });
                }
                console.log("Response from postclient for comment post:", result);
                return res.json(result);
            });
        } catch (error) {
            console.error("Error during delete comment post:", error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    },
}
