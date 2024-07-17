import express, { Request, Response, NextFunction } from "express";
import { RecruiterClient } from "./config/grpcClient/recruiterClient";
import * as dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();
export const recruiterController = {
  register: (req: Request, res: Response, next: NextFunction) => {
    try {
      RecruiterClient.Register(req.body, (err: Error | null, result: any) => {
        if (err) {
          console.error("Error:", err);
          return res.status(500).json({ error: 'Internal Server Error' });
        }
        const isRecruiter = true;
        res.cookie('isRecruiter', isRecruiter, { httpOnly: true, secure: true, sameSite: 'none', domain: '.climbrserver.site' });
        res.cookie('otp', result.otp, { httpOnly: true, secure: true, sameSite: 'none', domain: '.climbrserver.site' });
        if (typeof result.data === 'object' || Array.isArray(result.data)) {
          res.cookie('userdata', JSON.stringify(result.data), { httpOnly: true, secure: true, sameSite: 'none', domain: '.climbrserver.site' });
        }

        return res.json(result);
      });
    } catch (error) {
      console.error("Error during registering recruiter:", error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  },
  otp: (req: Request, res: Response, next: NextFunction) => {
    try {

      console.log(req.cookies.otp, req.cookies.userdata, 'coookiw');
      const otpFromCookie = req.cookies.otp;
      const userdataFromCookie = JSON.parse(req.cookies.userdata);
      const enterOtp = req.body.otp;
      RecruiterClient.OtpVerify({ userdata: userdataFromCookie, otp: otpFromCookie, enterOtp: enterOtp }, (err: Error | null, result: any) => {
        if (err) {
          console.error("Error:", err);
          return res.status(500).json({ error: 'Internal Server Error' });
        }
        const { username, email } = userdataFromCookie;
        if (!process.env.SECRET_KEY) {
          throw new Error('Secret key is not defined in environment variables');
        }
        const token = jwt.sign({ username, email }, process.env.SECRET_KEY, { expiresIn: '1h' })
        const expirationDate = new Date();
        expirationDate.setTime(expirationDate.getTime() + 60 * 60 * 1000);
        res.clearCookie('otp');
        res.cookie('token', token, { expires: expirationDate, httpOnly: true, secure: true, sameSite: 'none', domain: '.climbrserver.site' })
        let role = 'recruiter'
        res.cookie('role', role, { expires: expirationDate, httpOnly: true, secure: true, sameSite: 'none', domain: '.climbrserver.site' })
        result.user.role = role
        res.json(result);
      });
    } catch (error) {
      console.error("Error during verifying otp in recruiter:", error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  },
  login: (req: Request, res: Response, next: NextFunction) => {
    try {
      RecruiterClient.Login(req.body, (err: Error | null, result: any) => {
        if (err) {
          console.error("Error:", err);
          return res.status(500).json({ error: 'Internal Server Error' });
        }

        if (result.success) {
          const { email } = req.body.email;
          if (!process.env.SECRET_KEY) {
            throw new Error('Secret key is not defined in environment variables');
          }
          const { _id } = result.user
          const token = jwt.sign({ email, userId: _id }, process.env.SECRET_KEY, { expiresIn: '3h' })
          res.clearCookie('userdata');
          const expirationDate = new Date();
          expirationDate.setTime(expirationDate.getTime() + 60 * 60 * 1000);
          res.cookie('token', token, { expires: expirationDate, httpOnly: true, secure: true, sameSite: 'none', domain: '.climbrserver.site' });
          let role = 'recruiter'
          res.cookie('role', role, { expires: expirationDate, httpOnly: true, secure: true, sameSite: 'none', domain: '.climbrserver.site' })
          result.user.role = role
        }
        return res.json(result);
      })
    } catch (error) {
      console.error("Error during login recruiter:", error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  },
}
