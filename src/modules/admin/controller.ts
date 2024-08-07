import express, { Request, Response, NextFunction } from "express";
import { UserClient } from "../user/config/grpcClient/userClient";
import { RecruiterClient } from "../recruiter/config/grpcClient/recruiterClient";
import { PostClient } from "../post/config/grpcClient/postClient";
import { JobClient } from "../jobPost/config/grpcClient/jobClients";

export const adminController = {

    getallUser: (req: Request, res: Response, next: NextFunction) => {
        try {
            UserClient.Getall(req.body, (err: Error | null, result: any) => {
                if (err) {
                    console.error("Error: ", err);
                    return res.status(500).json({ error: 'Internal Server Error' });
                }
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
    deletepost: (req: Request, res: Response, next: NextFunction) => {
        try {
            const { postId } = req.params
            PostClient.DeletePost({ postId }, (err: Error | null, result: any) => {
                if (err) {
                    console.error("Error: ", err);
                    return res.status(500).json({ error: 'Internal Server Error' });
                }
                return res.json(result);
            })
        } catch (error) {
            console.error("Error during updating status:", error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    },
    getUserReport: (req: Request, res: Response, next: NextFunction) => {
        try {
            UserClient.GetReports({}, (err: Error | null, result: any) => {
                if (err) {
                    console.error("Error: ", err);
                    return res.status(500).json({ error: 'Internal Server Error' });
                }
                return res.json(result);
            })
        } catch (error) {
            console.error("Error during user status:", error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    },
    getRecruiterReport: (req: Request, res: Response, next: NextFunction) => {
        try {
            RecruiterClient.GetReports({}, (err: Error | null, result: any) => {
                if (err) {
                    console.error("Error: ", err);
                    return res.status(500).json({ error: 'Internal Server Error' });
                }
                return res.json(result);
            })
        } catch (error) {
            console.error("Error during user status:", error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    },
    getPostReport: (req: Request, res: Response, next: NextFunction) => {
        try {
            PostClient.GetReports({}, (err: Error | null, result: any) => {
                if (err) {
                    console.error("Error: ", err);
                    return res.status(500).json({ error: 'Internal Server Error' });
                }
                return res.json(result);
            })
        } catch (error) {
            console.error("Error during post status:", error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    },
    getJobReport: (req: Request, res: Response, next: NextFunction) => {
        try {
            JobClient.GetReports({}, (err: Error | null, result: any) => {
                if (err) {
                    console.error("Error: ", err);
                    return res.status(500).json({ error: 'Internal Server Error' });
                }
                return res.json(result);
            })
        } catch (error) {
            console.error("Error during job report:", error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    },
    getskills: (req: Request, res: Response, next: NextFunction) => {
        try {
            UserClient.Getskills({}, (err: Error | null, result: any) => {
                if (err) {
                    console.error("Error: ", err);
                    return res.status(500).json({ error: 'Internal Server Error' });
                }
                return res.json(result);
            })
        } catch (error) {
            console.error("Error during getting skills:", error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    },
    addskills: (req: Request, res: Response, next: NextFunction) => {
        try {
            const { skill } = req.body
            UserClient.AddSkill(req.body, (err: Error | null, result: any) => {
                if (err) {
                    console.error("Error: ", err);
                    return res.status(500).json({ error: 'Internal Server Error' });
                }
                return res.json(result);
            })
        } catch (error) {
            console.error("Error during adding skills:", error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    },
    updateskill: (req: Request, res: Response, next: NextFunction) => {
        try {
            const { skill } = req.body
            UserClient.UpdateSkill(req.body, (err: Error | null, result: any) => {
                if (err) {
                    console.error("Error: ", err);
                    return res.status(500).json({ error: 'Internal Server Error' });
                }

                return res.json(result);
            })
        } catch (error) {
            console.error("Error during update skills:", error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    },
    deleteskill: (req: Request, res: Response, next: NextFunction) => {
        try {
            const _id = req.params._id
            UserClient.DeleteSkill({ _id }, (err: Error | null, result: any) => {
                if (err) {
                    console.error("Error: ", err);
                    return res.status(500).json({ error: 'Internal Server Error' });
                }
                return res.json(result);
            })
        } catch (error) {
            console.error("Error during jdelete skills:", error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    },

}
