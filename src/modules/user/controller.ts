import express, { Request, Response, NextFunction } from "express";
import { UserClient } from "./config/grpcClient/userClient";
import { PostClient } from "../post/config/grpcClient/postClient";
import { JobClient } from '../jobPost/config/grpcClient/jobClients'
import * as dotenv from 'dotenv';
import jwt, { VerifyErrors } from 'jsonwebtoken';

dotenv.config();
export const UserController = {

  register: (req: Request, res: Response, next: NextFunction) => {
    try {
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
    } catch (error) {
      console.error("Error during registering user:", error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  },

  otp: (req: Request, res: Response, next: NextFunction) => {
    try {
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
          res.cookie('token', token, {
            expires: expirationDate, httpOnly: true, secure: true, sameSite: 'none'
          })
          let role = 'user'
          result.user.role = role
          res.cookie('role', role, { expires: expirationDate, secure: true, sameSite: 'none' })
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
    } catch (error) {
      console.error("Error during otp verifying user:", error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  },

  login: (req: Request, res: Response, next: NextFunction) => {
    try {
      UserClient.Login(req.body, (err: Error | null, result: any) => {
        if (err) {
          console.log(err, 'error while login');
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
          res.cookie('token', token, {
            expires: expirationDate, httpOnly: true, secure: true, sameSite: 'none'
          });
          let role = user.isAdmin ? 'admin' : 'user'
          result.user.role = role
          res.cookie('role', role, { expires: expirationDate, secure: true, sameSite: 'none' })
        }
        console.log(result, '===================');

        return res.json(result);
      })
    } catch (error) {
      console.error("Error during login user:", error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  },

  loginwithgoogle: (req: Request, res: Response, next: NextFunction) => {
    try {
      UserClient.LoginwithGoogle(req.body, (err: Error | null, result: any) => {
        if (err) {
          return res.status(500).json({ error: 'Internal Server Error' });
        }
        if (result.success) {
          if (!process.env.SECRET_KEY) {
            throw new Error('Secret key is not defined in environment variables');
          }
          const { _id, email } = result.user
          const token = jwt.sign({ email: email, userId: _id }, process.env.SECRET_KEY, { expiresIn: '2h' })
          const expirationDate = new Date();
          expirationDate.setTime(expirationDate.getTime() + 60 * 60 * 1000);
          const role = 'user'
          res.cookie('token', token, { expires: expirationDate });
          res.cookie('role', role, { expires: expirationDate })
        }
        console.log(result, 'google===================================');

        return res.json(result);
      })
    } catch (error) {
      console.error("Error during login with google user:", error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  },

  emailValidate: (req: Request, res: Response, next: NextFunction) => {
    try {
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
    } catch (error) {
      console.error("Error during email validating user:", error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  },

  resetPassword: (req: Request, res: Response, next: NextFunction) => {
    try {
      const password = req.body.password;
      const email = req.cookies.email;

      UserClient.Passwordreset({ email: email, password: password }, (err: Error | null, result: any) => {
        if (err) {
          console.error("Error: ", err);
          return res.status(500).json({ error: 'Internal Server Error' });
        }
        return res.json(result);
      })
    } catch (error) {
      console.error("Error during reset password user:", error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  },

  resendOtp: (req: Request, res: Response, next: NextFunction) => {
    try {
      const email = req.cookies.userdata ? JSON.parse(req.cookies.userdata).email : req.cookies.email;
      UserClient.ResendOtp({ email: email }, (err: Error | null, result: any) => {
        if (err) {
          console.error("Error: ", err);
          return res.status(500).json({ error: 'Internal Server Error' });
        }
        res.cookie('otp', result.otp, { httpOnly: true })
        return res.json(result);
      })
    } catch (error) {
      console.error("Error during resend otp user:", error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  },

  logout: (req: Request, res: Response, next: NextFunction) => {
    try {
      const role = req.cookies.role;
      if (role == 'recruiter') {
        res.clearCookie('token');
        res.clearCookie('role');
        res.status(200).json({ message: 'Logout successful' });
      } else {
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
          UserClient.Logout({ userId }, (err: Error | null, result: any) => {
            if (err) {
              console.error("Error: ", err);
              return res.status(500).json({ error: 'Internal Server Error' });
            }
            res.clearCookie('token');
            if (req.cookies.role) {
              res.clearCookie('role');
            }
            res.status(200).json({ message: 'Logout successful' });
          });
        });
      }
    } catch (error) {
      console.error("Error during logout user:", error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  },

  getStatus: (req: Request, res: Response, next: NextFunction) => {
    try {
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
          return res.json(result);
        });
      });
    } catch (error) {
      console.error("Error during get staus user:", error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  },

  getDetails: (req: Request, res: Response, next: NextFunction) => {
    try {
      const { id } = req.params;
      UserClient.UserDetails({ userId: id }, async (err: Error | null, result: any) => {
        if (err) {
          console.error("Error: ", err);
          return res.status(500).json({ error: 'Internal Server Error' });
        }

        try {
          PostClient.GetUserPost({ userId: id }, async (err: Error | null, postData: any) => {
            if (err) {
              console.error("Error fetching post data:", err);
              return res.status(500).json({ error: 'Internal Server Error' });
            }

            result.postData = postData.posts;

            if (result?.appliedJobs) {
              const jobIds = result.appliedJobs.map((job: any) => job.jobId);

              let jobDetails = await Promise.all(jobIds.map((id: string) => {
                return new Promise((resolve, reject) => {
                  JobClient.GetsingleJob({ id: id }, (err: Error | null, jobData: any) => {
                    if (err) {
                      console.error("Error fetching job data:", err);
                      reject(err);
                    } else {
                      resolve(jobData);
                    }
                  });
                });
              }));

              result.appliedJobs.forEach((job: any) => {
                job.jobData = jobDetails.find((data: any) => data._id == job.jobId);
              });
            }
            return res.json(result);
          });
        } catch (error) {
          console.error("Error during fetching post data:", error);
          return res.status(500).json({ error: 'Internal Server Error' });
        }
      });
    } catch (error) {
      console.error("Error during getDetails:", error);
      return res.status(500).json({ error: 'Internal Server Error' });
    }
  },





};
