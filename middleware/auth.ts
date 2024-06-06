import { Request, Response, NextFunction } from "express";
import jwt, { VerifyErrors } from 'jsonwebtoken';
import { UserClient } from "../src/modules/user/config/grpcClient/userClient";
import { RecruiterClient } from "../src/modules/recruiter/config/grpcClient/recruiterClient";

const secretKey = process.env.SECRET_KEY

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.token;
    console.log('---secret----', secretKey);
    if (!token) {
        console.log('notoken');
        return res.status(401).json({ message: 'Unauthorized: Token not provided' });
    }
    if (!process.env.SECRET_KEY) {
        console.log('noenv');

        throw new Error('Secret key is not defined in environment variables');
    }
    jwt.verify(token, process.env.SECRET_KEY, (err: VerifyErrors | null, decoded: any) => {
        if (err) {
            console.log('error', err);

            return res.status(401).json({ message: 'Unauthorized: Invalid token' });
        }
        console.log('--------');

        const userId = decoded.userId;
        const role = req.cookies.role;
        let userStatus
        const handleResponse = (status: boolean) => {
            if (status) {
                console.log('User/Recruiter is active');
                next();
            } else {
                console.log('User/Recruiter is inactive');
                return res.status(401).json({ message: 'Unauthorized: User/Recruiter is inactive' });
            }
        };
        if (role == 'user' || role == 'admin') {
            UserClient.GetStatus({ userId }, (err: Error | null, result: any) => {
                if (err) {
                    console.error("Error: ", err);
                    return res.status(500).json({ error: 'Internal Server Error' });
                }
                console.log("Response from userclient for auth:", result);
                handleResponse(result.status);

            });

        } else if (role == 'recruiter') {
            console.log(userId, '0-0-0-0-0-');

            RecruiterClient.GetStatus({ userId }, (err: Error | null, result: any) => {
                if (err) {
                    console.error("Error: ", err);
                    return res.status(500).json({ error: 'Internal Server Error' });
                }
                console.log("Response from recruiterclient for auth:", result);
                console.log(result.status, '-----');
                handleResponse(result.status);

            });
        }

    });
}

export default authMiddleware
