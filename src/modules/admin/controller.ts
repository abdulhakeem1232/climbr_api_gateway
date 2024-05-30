import express, { Request, Response, NextFunction } from "express";
import { UserClient } from "../user/config/grpcClient/userClient";
import { RecruiterClient } from "../recruiter/config/grpcClient/recruiterClient";
import { PostClient } from "../post/config/grpcClient/postClient";

export const adminController = {

    getallUser: (req: Request, res: Response, next: NextFunction) => {
        try {
            UserClient.Getall(req.body, (err: Error | null, result: any) => {
                if (err) {
                    console.error("Error: ", err);
                    return res.status(500).json({ error: 'Internal Server Error' });
                }
                console.log("Response from UserClient:", result);
                return res.json(result);
            })
        } catch (error) {
            console.error("Error during retrieving user:", error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    },

    updateStatus: (req: Request, res: Response, next: NextFunction) => {
        try {
            UserClient.UpdateStatus(req.body, (err: Error | null, result: any) => {
                if (err) {
                    console.error("Error: ", err);
                    return res.status(500).json({ error: 'Internal Server Error' });
                }
                console.log("Response from UserClient:", result);
                return res.json(result);
            })
        } catch (error) {
            console.error("Error during updateStatus user:", error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    },

    updateApproval: (req: Request, res: Response, next: NextFunction) => {
        try {
            RecruiterClient.Approval(req.body, (err: Error | null, result: any) => {
                if (err) {
                    console.error("Error: ", err);
                    return res.status(500).json({ error: 'Internal Server Error' });
                }
                console.log("Response from UserClient:", result);
                return res.json(result);
            })
        } catch (error) {
            console.error("Error during approving:", error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    },

    getallrecruiter: (req: Request, res: Response, next: NextFunction) => {
        try {
            RecruiterClient.Getall(req.body, (err: Error | null, result: any) => {
                if (err) {
                    console.error("Error: ", err);
                    return res.status(500).json({ error: 'Internal Server Error' });
                }
                console.log("Response from UserClient:", result);
                return res.json(result);
            })
        } catch (error) {
            console.error("Error during getting all recruiter:", error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    },

    updateStatusRecruiter: (req: Request, res: Response, next: NextFunction) => {
        try {
            RecruiterClient.UpdateStatus(req.body, (err: Error | null, result: any) => {
                if (err) {
                    console.error("Error: ", err);
                    return res.status(500).json({ error: 'Internal Server Error' });
                }
                console.log("Response from UserClient:", result);
                return res.json(result);
            })
        } catch (error) {
            console.error("Error during updating status:", error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    },

    reportedpost: (req: Request, res: Response, next: NextFunction) => {
        try {
            PostClient.GetReportedPost(req.body, async (err: Error | null, result: any) => {
                if (err) {
                    console.error("Error: ", err);
                    return res.status(500).json({ error: 'Internal Server Error' });
                }
                console.log("Response from UserClient for reported data:", result);
                if (!Array.isArray(result.posts) || result.posts.length === 0) {
                    return res.json({ posts: [] });
                }
                const userIds = result.posts.flatMap((post: any) =>
                    post.reported?.map((report: any) => report.userId) || []
                )
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
                    if (post.reported) {
                        post.reported.forEach((report: any) => {
                            report.userData = userData.find((user: any) => user._id === report.userId);
                        });
                    }
                });
                return res.json(result);
            })
        } catch (error) {
            console.error("Error during retrieving repoted posts:", error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    },

}
