import express, { Request, Response, NextFunction } from "express";
import { JobClient } from "./config/grpcClient/jobClients";
import { UserClient } from "../user/config/grpcClient/userClient";


export const jobController = {
    createJob: (req: Request, res: Response) => {
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
            const { jobid, userid } = req.body;
            const buffer = req.file?.buffer;
            const fileDetails = {
                originalname: req.file?.originalname,
                encoding: req.file?.encoding,
                mimetype: req.file?.mimetype,
                buffer: req.file?.buffer,
                size: req.file?.size
            };
            req.body.cv = fileDetails;

            JobClient.ApplyJob(req.body, (applyErr: Error | null, applyResult: any) => {
                if (applyErr) {
                    console.error("Error applying for job:", applyErr);
                    return res.status(500).json({ error: 'Internal Server Error' });
                }
                const status = applyResult.status
                if (status == 'Applicant has already applied for this job.') {
                    return res.json({ message: 'Applicant has already applied for this job.' });
                }
                UserClient.UpdateJobStatus({ jobid, userid, status }, (updateErr: Error | null, updateResult: any) => {
                    if (updateErr) {
                        console.error("Error updating job status:", updateErr);
                        return res.status(500).json({ error: 'Error updating job status' });
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
            const postId = req.body.postId
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
    getApplicantsChart: (req: Request, res: Response) => {
        try {
            const { userId } = req.params
            JobClient.GetApplicantsReports({ userId }, (err: Error | null, result: any) => {
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
    getApplicants: (req: Request, res: Response) => {
        try {
            const id = req.params.jobId
            JobClient.GetApplicants({ id }, (err: Error | null, result: any) => {
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
    updateStatus: (req: Request, res: Response) => {
        try {
            const { jobId, userId, status } = req.body
            JobClient.ChangeStatus({ jobId, userId, status }, (err: Error | null, result: any) => {
                if (err) {
                    console.error("Error:", err);
                    return res.status(500).json({ error: 'Internal Server Error' });
                }
                UserClient.updateJobStatus({ jobId, userId, status }, (err: Error | null, result: any) => {
                    if (err) {
                        console.error("Error:", err);
                        return res.status(500).json({ error: 'Internal Server Error' });
                    }
                    return res.json(result);
                })
            });
        } catch (error) {
            console.error("Error during updating job:", error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    },
} 
