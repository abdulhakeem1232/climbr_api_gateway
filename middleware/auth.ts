import { Request, Response, NextFunction } from "express";
import jwt, { VerifyErrors } from 'jsonwebtoken';
import { UserClient } from "../src/modules/user/config/grpcClient/userClient";
import { RecruiterClient } from "../src/modules/recruiter/config/grpcClient/recruiterClient";

const secretKey = process.env.SECRET_KEY;

const authMiddleware = (req: Request, res: Response, next: NextFunction) => {

    const cookieToken = req.cookies.token;
    const authHeader = req.headers.authorization;
    let headerToken = '';

    if (authHeader && authHeader.startsWith('Bearer ')) {
        headerToken = authHeader.split(' ')[1];
    }

    if (!cookieToken || !headerToken) {
        console.log('Token missing in cookies or Authorization header');
        return res.status(401).json({ message: 'Unauthorized: Token not provided' });
    }

    if (cookieToken !== headerToken) {
        console.log('Token mismatch between cookies and Authorization header');
        return res.status(401).json({ message: 'Unauthorized: Token mismatch' });
    }

    jwt.verify(cookieToken, secretKey!, (err: VerifyErrors | null, decoded: any) => {
        if (err) {
            console.log('Error during token verification:', err);
            return res.status(401).json({ message: 'Unauthorized: Invalid token' });
        }

        const userId = decoded.userId;
        const role = req.cookies.role || decoded.role;

        const handleResponse = (status: boolean) => {
            if (status) {
                next();
            } else {
                console.log('User/Recruiter is inactive');
                return res.status(401).json({ message: 'Unauthorized: User/Recruiter is inactive' });
            }
        };

        if (role === 'user' || role === 'admin') {
            UserClient.GetStatus({ userId }, (err: Error | null, result: any) => {
                if (err) {
                    console.error("Error: ", err);
                    return res.status(500).json({ error: 'Internal Server Error' });
                }
                console.log(result, 'User status check result');
                handleResponse(result.status);
            });
        } else if (role === 'recruiter') {
            RecruiterClient.GetStatus({ userId }, (err: Error | null, result: any) => {
                if (err) {
                    console.error("Error: ", err);
                    return res.status(500).json({ error: 'Internal Server Error' });
                }
                console.log(result, 'Recruiter status check result');
                handleResponse(result.status);
            });
        } else {
            console.log('Unknown role');
            return res.status(401).json({ message: 'Unauthorized: Invalid role' });
        }
    });
};

export default authMiddleware;
