import express, { Request, Response, NextFunction } from "express";
import { UserClient } from "./config/grpcClient/userClient";
import * as dotenv from 'dotenv';
import jwt from 'jsonwebtoken';

dotenv.config();
export const UserController = {
  register: (req: Request, res: Response, next: NextFunction) => {
    console.log("came api gateway",req.body);
    UserClient.Register(req.body, (err: Error | null, result: any) => {
      if (err) {
        console.error("Error:", err);
        return res.status(500).json({ error: 'Internal Server Error' }); 
      }
      console.log("Response from UserClient:", result);
      const isRecruiter = false;
          res.cookie('isRecruiter', isRecruiter);
      res.cookie('otp',result.otp, { httpOnly: true })
      if (typeof result.data === 'object' || Array.isArray(result.data)) {
        res.cookie('userdata', JSON.stringify(result.data), { httpOnly: true });
      }

      return res.json(result);
    });
    console.log("weniff");
  },
  otp: (req:Request,res:Response,next:NextFunction)=>{
    console.log('came otp', req.body);
    console.log(req.cookies.otp, req.cookies.userdata, 'coookiw');
    const otpFromCookie = req.cookies.otp;
    const userdataFromCookie = JSON.parse(req.cookies.userdata);
    const enterOtp = req.body.otp; 
    console.log('ppp',userdataFromCookie);
    
    UserClient.OtpVerify({  userdata:userdataFromCookie, otp:otpFromCookie,enterOtp:enterOtp }, (err: Error | null, result: any) => {
      if (err) {
        console.error("Error:", err);
        return res.status(500).json({ error: 'Internal Server Error' }); 
      }
      console.log("Response from UserClient:", result);
      const {email}=userdataFromCookie;
      if (!process.env.SECRET_KEY) {
        throw new Error('Secret key is not defined in environment variables');
      }
      const token=jwt.sign({email},process.env.SECRET_KEY,{ expiresIn: '1h' })
      console.log('token',token);
      res.clearCookie('otp');
      res.cookie('token',token,{httpOnly:true})
      let role='user'
      res.cookie('role',role,{httpOnly:true})

      res.json(result); 
    });
  },
  login:(req:Request,res:Response,next:NextFunction)=>{
    console.log('came login', req.body);
    UserClient.Login(req.body, (err: Error | null, result: any) => {
      if (err) {
        console.error("Error:", err);
        return res.status(500).json({ error: 'Internal Server Error' }); 
      }
      console.log("Response from UserClient:", result);
      if(result.success){
    const user = result.user
    const {email}=req.body.email
    if (!process.env.SECRET_KEY) {
      throw new Error('Secret key is not defined in environment variables');
    }
    const token=jwt.sign({email},process.env.SECRET_KEY,{ expiresIn: '1h' })
    console.log('token',token);
    res.clearCookie('userdata');
    res.cookie('token',token,{httpOnly:true});
      }
      return res.json(result);
    })
  },
  loginwithgoogle:(req:Request,res:Response,next:NextFunction)=>{
    console.log('came googlelogin', req.body);
    UserClient.LoginwithGoogle(req.body, (err: Error | null, result: any) => {
      if (err) {
        console.error("Error: ", err);
        return res.status(500).json({ error: 'Internal Server Error' }); 
      }
      console.log("Response from UserClient:", result);
      if(result.success){
    if (!process.env.SECRET_KEY) {
      throw new Error('Secret key is not defined in environment variables');
    }
    const {username,email}=result.user
    const token=jwt.sign({username,email},process.env.SECRET_KEY,{ expiresIn: '1h' })
    console.log('token',token);
    res.cookie('token',token,{httpOnly:true});
      }
      return res.json(result);
    })
  },
  
  
};
