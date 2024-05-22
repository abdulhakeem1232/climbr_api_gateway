import express, { Request, Response, NextFunction } from "express";
import { RecruiterClient } from "./config/grpcClient/recruiterClient";
import * as dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();
export const recruiterController = {
  register: (req: Request, res: Response, next: NextFunction) => {
    console.log("came apiweqdqe gateway", req.body);
    RecruiterClient.Register(req.body, (err: Error | null, result: any) => {
      if (err) {
        console.error("Error:", err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
      console.log("Response from UserClient:", result);
      const isRecruiter = true;
      res.cookie('isRecruiter', isRecruiter);
      res.cookie('otp', result.otp, { httpOnly: true });
      if (typeof result.data === 'object' || Array.isArray(result.data)) {
        res.cookie('userdata', JSON.stringify(result.data), { httpOnly: true });
      }

      return res.json(result);
    });
    console.log("weniff");
  },
  otp: (req: Request, res: Response, next: NextFunction) => {
    console.log('came otp', req.body);
    console.log(req.cookies.otp, req.cookies.userdata, 'coookiw');
    const otpFromCookie = req.cookies.otp;
    const userdataFromCookie = JSON.parse(req.cookies.userdata);
    const enterOtp = req.body.otp;
    console.log('ppp', userdataFromCookie);

    RecruiterClient.OtpVerify({ userdata: userdataFromCookie, otp: otpFromCookie, enterOtp: enterOtp }, (err: Error | null, result: any) => {
      if (err) {
        console.error("Error:", err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
      console.log("Response from UserClient:", result);
      const { username, email } = userdataFromCookie;
      if (!process.env.SECRET_KEY) {
        throw new Error('Secret key is not defined in environment variables');
      }
      const token = jwt.sign({ username, email }, process.env.SECRET_KEY, { expiresIn: '3h' })
      console.log('token', token);
      res.clearCookie('otp');
      res.cookie('token', token, {})
      let role = 'recruiter'
      res.cookie('role', role,)

      res.json(result);
    });
  },
  login: (req: Request, res: Response, next: NextFunction) => {
    console.log('came otp', req.body);
    RecruiterClient.Login(req.body, (err: Error | null, result: any) => {
      if (err) {
        console.error("Error:", err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
      console.log("Response from UserClient:", result);

      if (result.success) {

        const { email } = req.body.email;
        if (!process.env.SECRET_KEY) {
          throw new Error('Secret key is not defined in environment variables');
        }
        const token = jwt.sign({ email }, process.env.SECRET_KEY, { expiresIn: '3h' })
        console.log('token', token);
        res.clearCookie('userdata');
        res.cookie('token', token);
        let role = 'recruiter'
        res.cookie('role', role,)
      }
      return res.json(result);
    })
  },
  getall: (req: Request, res: Response, next: NextFunction) => {
    console.log('came getall recruiter');
    RecruiterClient.Getall(req.body, (err: Error | null, result: any) => {
      if (err) {
        console.error("Error: ", err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
      console.log("Response from UserClient:", result);
      return res.json(result);
    })
  },
  updateStatus: (req: Request, res: Response, next: NextFunction) => {
    console.log('came getallreee');
    RecruiterClient.UpdateStatus(req.body, (err: Error | null, result: any) => {
      if (err) {
        console.error("Error: ", err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
      console.log("Response from UserClient:", result);
      return res.json(result);
    })
  },
  updateApproval: (req: Request, res: Response, next: NextFunction) => {
    console.log('came getallreee');
    RecruiterClient.Approval(req.body, (err: Error | null, result: any) => {
      if (err) {
        console.error("Error: ", err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
      console.log("Response from UserClient:", result);
      return res.json(result);
    })
  },

}
