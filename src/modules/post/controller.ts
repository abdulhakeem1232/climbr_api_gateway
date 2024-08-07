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
            let email, userId
            if (process.env.SECRET_KEY) {
                const decoded = jwt.verify(token, process.env.SECRET_KEY) as JwtPayload;
                email = decoded.email;
                userId = decoded.userId
            }
            const { originalname, encoding, mimetype, buffer, size } = req.file || {};
            const fileDetails = {
                originalname,
                encoding,
                mimetype,
                buffer,
                size
            };
            PostClient.CreatePost({ image: fileDetails, userId: userId, description: description }, (err: Error | null, result: any) => {
                if (err) {
                    console.error("Error: ", err);
                    return res.status(500).json({ error: 'Internal Server Error' });
                }
                return res.json(result);
            });
        } catch (error) {
            console.error("Error during creatinbg post:", error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    },
    getallpost: (req: Request, res: Response, next: NextFunction) => {

        let { page, limit } = req.query;
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

                return res.json(result);
            } catch (error) {
                return res.status(500).json({ error: 'Internal Server Error' });
            }
        });
    },
    like: (req: Request, res: Response, next: NextFunction) => {
        try {
            const { userId, postId } = req.body
            PostClient.PostLike({ userId, postId }, (err: Error | null, result: any) => {
                if (err) {
                    console.error("Error: ", err);
                    return res.status(500).json({ error: 'Internal Server Error' });
                }
                return res.json(result);
            });
        } catch (error) {
            console.error("Error during liking post:", error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    },
    dislike: (req: Request, res: Response, next: NextFunction) => {
        try {
            const { userId, postId } = req.body
            PostClient.PostDisLike({ userId, postId }, (err: Error | null, result: any) => {
                if (err) {
                    console.error("Error: ", err);
                    return res.status(500).json({ error: 'Internal Server Error' });
                }
                return res.json(result);
            });
        } catch (error) {
            console.error("Error during disliking post:", error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    },
    comment: (req: Request, res: Response, next: NextFunction) => {
        try {
            const { userId, postId, comment } = req.body
            PostClient.PostComment({ userId, postId, comment }, (err: Error | null, result: any) => {
                if (err) {
                    console.error("Error: ", err);
                    return res.status(500).json({ error: 'Internal Server Error' });
                }
                return res.json(result);
            });
        } catch (error) {
            console.error("Error during commenting post:", error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    },
    deletComment: (req: Request, res: Response, next: NextFunction) => {
        try {
            const { postId, commentId } = req.body
            PostClient.DeleteComment({ postId, commentId }, (err: Error | null, result: any) => {
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
    reportPost: (req: Request, res: Response, next: NextFunction) => {
        try {
            const { postId, reason, userId } = req.body
            PostClient.ReportPost({ postId, reason, userId }, (err: Error | null, result: any) => {
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
    delete: (req: Request, res: Response, next: NextFunction) => {
        try {
            const { postId } = req.body
            PostClient.DeletePost({ postId }, (err: Error | null, result: any) => {
                if (err) {
                    console.error("Error: ", err);
                    return res.status(500).json({ error: 'Internal Server Error' });
                }
                return res.json(result);
            });
        } catch (error) {
            console.error("Error during delete  post:", error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    },
    editPost: (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params
            const { description } = req.body
            PostClient.EditPost({ postId: id, description: description }, (err: Error | null, result: any) => {
                if (err) {
                    console.error("Error: ", err);
                    return res.status(500).json({ error: 'Internal Server Error' });
                }
                return res.json(result);
            });
        } catch (error) {
            console.error("Error during edit post:", error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    },
}
