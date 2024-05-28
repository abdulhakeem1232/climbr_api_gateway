import express, { Request, Response, NextFunction } from "express";
import { UserClient } from "./config/grpcClient/userClient";
import * as dotenv from 'dotenv';
import jwt, { VerifyErrors } from 'jsonwebtoken';

dotenv.config();
export const UserController = {
  register: (req: Request, res: Response, next: NextFunction) => {
    UserClient.Register(req.body, (err: Error | null, result: any) => {
      if (err) {
        return res.status(500).json({ error: 'Internal Server Error' });
      }
      const isRecruiter = false;
      res.cookie('isRecruiter', isRecruiter);
      res.cookie('otp', result.otp, { httpOnly: true })
      console.log(result.otp, 'otp');

      if (typeof result.data === 'object' || Array.isArray(result.data)) {
        res.cookie('userdata', JSON.stringify(result.data), { httpOnly: true });
      }
      return res.json(result);
    });
  },

  otp: (req: Request, res: Response, next: NextFunction) => {
    const otpFromCookie = req.cookies.otp;
    const email = req.cookies.email;
    const userdataFromCookie = req.cookies.userdata ? JSON.parse(req.cookies.userdata) : undefined;
    const enterOtp = req.body.otp;
    if (userdataFromCookie) {
      UserClient.OtpVerify({ userdata: userdataFromCookie, otp: otpFromCookie, enterOtp: enterOtp }, (err: Error | null, result: any) => {
        if (err) {
          return res.status(500).json({ error: 'Internal Server Error' });
        }
        const user = result.userdata
        const { email } = userdataFromCookie;
        if (!process.env.SECRET_KEY) {
          throw new Error('Secret key is not defined in environment variables');
        }
        const token = jwt.sign({ email: email, userId: user._id }, process.env.SECRET_KEY, { expiresIn: '1h' })
        const expirationDate = new Date();
        expirationDate.setTime(expirationDate.getTime() + 60 * 60 * 1000);
        res.clearCookie('otp');
        res.cookie('token', token, { expires: expirationDate })
        let role = 'user'
        res.cookie('role', role, { expires: expirationDate })
        res.json(result);
      });
    } else {
      UserClient.passwordotp({ email: email, otp: otpFromCookie, enteredOtp: enterOtp }, (err: Error | null, result: any) => {
        if (err) {
          return res.status(500).json({ error: 'Internal Server Error' });
        }
        res.json(result);
      });
    }
  },

  login: (req: Request, res: Response, next: NextFunction) => {
    UserClient.Login(req.body, (err: Error | null, result: any) => {
      if (err) {
        return res.status(500).json({ error: 'Internal Server Error' });
      }
      if (result.success) {
        const user = result.user
        const { email } = req.body
        if (!process.env.SECRET_KEY) {
          throw new Error('Secret key is not defined in environment variables');
        }
        const token = jwt.sign({ email: email, userId: user._id }, process.env.SECRET_KEY, { expiresIn: '2h' })
        const expirationDate = new Date();
        expirationDate.setTime(expirationDate.getTime() + 60 * 60 * 1000);
        res.clearCookie('userdata');
        res.cookie('token', token, { expires: expirationDate });
        let role = user.isAdmin ? 'admin' : 'user'
        res.cookie('role', role, { expires: expirationDate })
      }
      return res.json(result);
    })
  },
  loginwithgoogle: (req: Request, res: Response, next: NextFunction) => {
    UserClient.LoginwithGoogle(req.body, (err: Error | null, result: any) => {
      if (err) {
        return res.status(500).json({ error: 'Internal Server Error' });
      }
      if (result.success) {
        if (!process.env.SECRET_KEY) {
          throw new Error('Secret key is not defined in environment variables');
        }
        const { id, email } = result.user
        const token = jwt.sign({ email: email, userId: id }, process.env.SECRET_KEY, { expiresIn: '1h' })
        const expirationDate = new Date();
        expirationDate.setTime(expirationDate.getTime() + 60 * 60 * 1000);
        res.cookie('token', token, { expires: expirationDate });
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
    const email = req.cookies.userdata ? JSON.parse(req.cookies.userdata).email : req.cookies.email;

    UserClient.ResendOtp({ email: email }, (err: Error | null, result: any) => {
      if (err) {
        console.error("Error: ", err);
        return res.status(500).json({ error: 'Internal Server Error' });
      }
      res.cookie('otp', result.otp, { httpOnly: true })
      return res.json(result);
    })
  },
  logout: (req: Request, res: Response, next: NextFunction) => {
    res.clearCookie('token');
    if (req.cookies.role) {
      res.clearCookie('role');
    }
    res.status(200).json({ message: 'Logout successful' });
  },
  getStatus: (req: Request, res: Response, next: NextFunction) => {
    const token = req.cookies.token;
    if (!process.env.SECRET_KEY) {
      throw new Error('Secret key is not defined in environment variables');
    }
    jwt.verify(token, process.env.SECRET_KEY, (err: any, decoded: any) => {
      if (err) {
        console.error("Error decoding token: ", err);
        return res.status(401).json({ error: 'Unauthorized' });
      }

      const userId = decoded.userId;
      UserClient.GetStatus({ userId }, (err: Error | null, result: any) => {
        if (err) {
          console.error("Error: ", err);
          return res.status(500).json({ error: 'Internal Server Error' });
        }
        console.log("Response from userclient for auth in api gateway:", result);
        return res.json(result);
      });
    });
  }



};
