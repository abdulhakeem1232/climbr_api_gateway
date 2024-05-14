import express, { Request, Response, NextFunction } from "express";
import { UserClient } from "./config/grpcClient/userClient";
import * as dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();
export const UserController = {
  register: (req: Request, res: Response, next: NextFunction) => {
    console.log("came api gateway", req.body);
    UserClient.Register(req.body, (err: Error | null, result: any) => {
      if (err) {
        console.error("Error:", err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
      console.log("Response from UserClient:", result);
      const isRecruiter = false;
      res.cookie('isRecruiter', isRecruiter);
      res.cookie('otp', result.otp, { httpOnly: true })
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
    const email = req.cookies.email;
    const userdataFromCookie = req.cookies.userdata ? JSON.parse(req.cookies.userdata) : undefined;
    const enterOtp = req.body.otp;
    console.log('ppp', userdataFromCookie);
    if (userdataFromCookie) {
      UserClient.OtpVerify({ userdata: userdataFromCookie, otp: otpFromCookie, enterOtp: enterOtp }, (err: Error | null, result: any) => {
        if (err) {
          console.error("Error:", err);
          return res.status(500).json({ error: 'Internal Server Error' });
        }
        console.log("Response from UserClient:", result);
        const user = result.user
        console.log(user, 'user----');
        const { email } = userdataFromCookie;
        if (!process.env.SECRET_KEY) {
          throw new Error('Secret key is not defined in environment variables');
        }
        const token = jwt.sign({ email: email, userId: user._id }, process.env.SECRET_KEY, { expiresIn: '1h' })
        console.log('token', token);
        res.clearCookie('otp');
        res.cookie('token', token, {})
        let role = 'user'
        res.cookie('role', role, {})

        res.json(result);
      });
    } else {
      UserClient.passwordotp({ email: email, otp: otpFromCookie, enteredOtp: enterOtp }, (err: Error | null, result: any) => {
        if (err) {
          console.error("Error:", err);
          return res.status(500).json({ error: 'Internal Server Error' });
        }
        console.log("Response from UserClient:", result);
        res.json(result);
      });
    }
  },
  login: (req: Request, res: Response, next: NextFunction) => {
    console.log('came login', req.body);
    UserClient.Login(req.body, (err: Error | null, result: any) => {
      if (err) {
        console.error("Error:", err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
      console.log("Response from UserClient:", result);
      if (result.success) {
        const user = result.user
        console.log(user, 'user----');

        const { email } = req.body
        console.log(email, '-----');

        if (!process.env.SECRET_KEY) {
          throw new Error('Secret key is not defined in environment variables');
        }
        const token = jwt.sign({ email: email, userId: user._id }, process.env.SECRET_KEY, { expiresIn: '1h' })
        console.log('token', token);
        res.clearCookie('userdata');
        res.cookie('token', token, { httpOnly: true });
      }
      return res.json(result);
    })
  },
  loginwithgoogle: (req: Request, res: Response, next: NextFunction) => {
    console.log('came googlelogin', req.body);
    UserClient.LoginwithGoogle(req.body, (err: Error | null, result: any) => {
      if (err) {
        console.error("Error: ", err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
      console.log("Response from UserClient:", result);
      if (result.success) {
        if (!process.env.SECRET_KEY) {
          throw new Error('Secret key is not defined in environment variables');
        }
        const { username, email } = result.user
        const token = jwt.sign({ email: email }, process.env.SECRET_KEY, { expiresIn: '1h' })
        console.log('token', token);
        res.cookie('token', token, { httpOnly: true });
      }
      return res.json(result);
    })
  },
  getall: (req: Request, res: Response, next: NextFunction) => {
    console.log('came getalluyser');
    UserClient.Getall(req.body, (err: Error | null, result: any) => {
      if (err) {
        console.error("Error: ", err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
      console.log("Response from UserClient:", result);
      return res.json(result);
    })
  },
  updateStatus: (req: Request, res: Response, next: NextFunction) => {
    console.log('came getalluyser');
    UserClient.UpdateStatus(req.body, (err: Error | null, result: any) => {
      if (err) {
        console.error("Error: ", err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
      console.log("Response from UserClient:", result);
      return res.json(result);
    })
  },
  emailValidate: (req: Request, res: Response, next: NextFunction) => {
    console.log('came email validate', req.body);
    UserClient.EmailValidate(req.body, (err: Error | null, result: any) => {
      if (err) {
        console.error("Error: ", err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
      console.log("Response from UserClient:", result);
      if (result.success) {
        res.cookie('email', req.body.email, {});
        res.cookie('otp', result.otp, {});
      }
      return res.json(result);
    })
  },
  resetPassword: (req: Request, res: Response, next: NextFunction) => {
    console.log('came password reset', req.body);
    const password = req.body.password;
    const email = req.cookies.email;
    console.log('emailpassword', password, email, req.body);

    UserClient.Passwordreset({ email: email, password: password }, (err: Error | null, result: any) => {
      if (err) {
        console.error("Error: ", err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
      console.log("Response from UserClient for reset password:", result);
      return res.json(result);
    })
  },
  resendOtp: (req: Request, res: Response, next: NextFunction) => {
    console.log('resendOtp');
    const email = req.cookies.userdata ? JSON.parse(req.cookies.userdata).email : req.cookies.email;
    console.log(email, 'from resend');

    UserClient.ResendOtp({ email: email }, (err: Error | null, result: any) => {
      if (err) {
        console.error("Error: ", err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
      console.log("Response from UserClient for reset password:", result);
      res.cookie('otp', result.otp, { httpOnly: true })
      return res.json(result);
    })
  },



};
