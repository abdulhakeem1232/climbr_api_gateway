import express, { Request, Response, NextFunction } from "express";
import { JobClient } from "./config/grpcClient/jobClients";


export const jobController = {
    createJob: (req: Request, res: Response, next: NextFunction) => {
        console.log("came apiweqdqe gateway job", req.body);
        const buffer = req.file?.buffer
        const fileDetails = {
            originalname: req.file?.originalname,
            encoding: req.file?.encoding,
            mimetype: req.file?.mimetype,
            buffer: req.file?.buffer,
            size: req.file?.size
        }
        console.log('image', fileDetails);
        req.body.companylogo = fileDetails;

        JobClient.CreateJob(req.body, (err: Error | null, result: any) => {
            if (err) {
                console.error("Error:", err);
                return res.status(500).json({ error: 'Internal Server Error' });
            }
            console.log("Response from jobClient:", result);
        });
    },
    getJob: (req: Request, res: Response) => {
        const userId = req.params.userId
        console.log(userId);

        JobClient.GetJob({ userId }, (err: Error | null, result: any) => {
            if (err) {
                console.error("Error:", err);
                return res.status(500).json({ error: 'Internal Server Error' });
            }
            console.log("Response from jobClient:", result);
            return res.json(result);
        });
    },
    getallJob: (req: Request, res: Response) => {
        console.log('getall00000000000');
        JobClient.GetAllJob(req.body, (err: Error | null, result: any) => {
            if (err) {
                console.error("Error:", err);
                return res.status(500).json({ error: 'Internal Server Error' });
            }
            console.log("Response from jobClient:", result);
            return res.json(result);
        });
    },
}
