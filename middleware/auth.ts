import { Request, Response, NextFunction } from "express";
import jwt, { VerifyErrors } from 'jsonwebtoken';

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
        console.log('next');

        next();
    });
    console.log('else');



}

export default authMiddleware
