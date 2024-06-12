import express, { Request, Response, NextFunction } from "express";
import { JobClient } from "./config/grpcClient/jobClients";
import { UserClient } from "../user/config/grpcClient/userClient";


export const jobController = {
    createJob: (req: Request, res: Response, next: NextFunction) => {
        try {
            const buffer = req.file?.buffer
            const fileDetails = {
                originalname: req.file?.originalname,
                encoding: req.file?.encoding,
                mimetype: req.file?.mimetype,
                buffer: req.file?.buffer,
                size: req.file?.size
            }
            req.body.companylogo = fileDetails;

            JobClient.CreateJob(req.body, (err: Error | null, result: any) => {
                if (err) {
                    console.error("Error:", err);
                    return res.status(500).json({ error: 'Internal Server Error' });
                }
                return res.json(result);
            });
        } catch (error) {
            console.error("Error during creatinbg job:", error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    },
    getJob: (req: Request, res: Response) => {
        try {
            const userId = req.params.userId
            console.log(userId);

            JobClient.GetJob({ userId }, (err: Error | null, result: any) => {
                if (err) {
                    console.error("Error:", err);
                    return res.status(500).json({ error: 'Internal Server Error' });
                }
                return res.json(result);
            });
        } catch (error) {
            console.error("Error during receiving job:", error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    },
    getallJob: (req: Request, res: Response) => {
        try {
            JobClient.GetAllJob(req.body, (err: Error | null, result: any) => {
                if (err) {
                    console.error("Error:", err);
                    return res.status(500).json({ error: 'Internal Server Error' });
                }
                return res.json(result);
            });
        } catch (error) {
            console.error("Error during receiving all job:", error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    },
    getsingleJob: (req: Request, res: Response) => {
        try {
            const id = req.params.id
            JobClient.GetsingleJob({ id }, (err: Error | null, result: any) => {
                if (err) {
                    console.error("Error:", err);
                    return res.status(500).json({ error: 'Internal Server Error' });
                }
                return res.json(result);
            });
        } catch (error) {
            console.error("Error during receiving single job:", error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    },
    applyJob: (req: Request, res: Response) => {
        try {
            console.log(req.body, 'll');
            const { jobid, userid } = req.body
            const status = 'Applied'
            console.log(req.file?.buffer);
            const buffer = req.file?.buffer
            const fileDetails = {
                originalname: req.file?.originalname,
                encoding: req.file?.encoding,
                mimetype: req.file?.mimetype,
                buffer: req.file?.buffer,
                size: req.file?.size
            }
            req.body.cv = fileDetails;
            UserClient.UpdateJobStatus({ jobid, userid, status }, (updateErr: Error | null, updateResult: any) => {
                if (updateErr) {
                    console.error("Error updating job status:", updateErr);
                    return res.status(500).json({ error: 'Error updating job status' });
                }
                JobClient.ApplyJob(req.body, (applyErr: Error | null, applyResult: any) => {
                    if (applyErr) {
                        console.error("Error:", applyErr);
                        return res.status(500).json({ error: 'Internal Server Error' });
                    }
                    return res.json({ message: 'Job applied successfully and status updated' });
                });
            });
        } catch (error) {
            console.error("Error during applying job:", error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    },
    deleteJob: (req: Request, res: Response) => {
        try {
            console.log('delete job');
            const postId = req.body.postId
            console.log(postId, '---==--=--');

            JobClient.DeleteJob({ postId }, (err: Error | null, result: any) => {
                if (err) {
                    console.error("Error:", err);
                    return res.status(500).json({ error: 'Internal Server Error' });
                }
                return res.json(result);
            });
        } catch (error) {
            console.error("Error during deleting job:", error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    },
    updatejob: (req: Request, res: Response) => {
        try {
            console.log('update job');

            console.log(req.body, '---==--=--');

            JobClient.UpdateJob(req.body, (err: Error | null, result: any) => {
                if (err) {
                    console.error("Error:", err);
                    return res.status(500).json({ error: 'Internal Server Error' });
                }
                return res.json(result);
            });
        } catch (error) {
            console.error("Error during updating job:", error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    },
    searchJob: (req: Request, res: Response) => {
        try {
            const { filteredJobs, searchTerm } = req.body;
            const searchTermLowerCase = searchTerm.toLowerCase();
            const matchedJobs = filteredJobs.filter((job: { joblocation: string; }) => {
                const jobLocationLowerCase = job.joblocation.toLowerCase();
                return jobLocationLowerCase.includes(searchTermLowerCase);
            });
            return res.json({ matchedJobs });
        } catch (error) {
            console.error("Error during searcinhg job:", error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    },
}
