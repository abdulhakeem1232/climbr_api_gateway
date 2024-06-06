import express, { Request, Response, NextFunction } from "express";
import { UserClient } from "./config/grpcClient/userClient";

export const profileController = {
    coverPhoto: (req: Request, res: Response, next: NextFunction) => {
        try {
            console.log(req.body, '-----------');

            const { id } = req.params
            const image = {
                originalname: req.file?.originalname,
                encoding: req.file?.encoding,
                mimetype: req.file?.mimetype,
                buffer: req.file?.buffer,
                size: req.file?.size
            }
            UserClient.UpdateCover({ image, userId: id }, (err: Error | null, result: any) => {
                if (err) {
                    return res.status(500).json({ error: 'Internal Server Error' });
                }
                return res.json(result);
            });
        } catch (error) {
            console.error("Error during updatring cover photo:", error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    },
    profilePhoto: (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params
            const image = {
                originalname: req.file?.originalname,
                encoding: req.file?.encoding,
                mimetype: req.file?.mimetype,
                buffer: req.file?.buffer,
                size: req.file?.size
            }
            UserClient.UpdateProfile({ image, userId: id }, (err: Error | null, result: any) => {
                if (err) {
                    return res.status(500).json({ error: 'Internal Server Error' });
                }
                return res.json(result);
            });
        } catch (error) {
            console.error("Error during updatring profile photo:", error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    },
    profileData: (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params
            UserClient.UpdateProfileData({
                id: id, header: req.body.header, mobile: req.body.mobile
            }, (err: Error | null, result: any) => {
                if (err) {
                    return res.status(500).json({ error: 'Internal Server Error' });
                }
                return res.json(result);
            });
        } catch (error) {
            console.error("Error during updatring profile photo:", error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    },
    educationData: (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params
            console.log(req.body);
            UserClient.UpdateEducationData({
                userId: id, school: req.body.schoolName, degree: req.body.degree, field: req.body.fieldOfStudy, started: req.body.startDate, ended: req.body.endDate
            }, (err: Error | null, result: any) => {
                if (err) {
                    return res.status(500).json({ error: 'Internal Server Error' });
                }
                return res.json(result);
            });
        } catch (error) {
            console.error("Error during updatring profile photo:", error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    },
    experiencenData: (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params
            console.log(req.body);
            UserClient.UpdateExperienceData({
                userId: id, company: req.body.companyName, role: req.body.role, started: req.body.startDate, ended: req.body.endDate
            }, (err: Error | null, result: any) => {
                if (err) {
                    return res.status(500).json({ error: 'Internal Server Error' });
                }
                return res.json(result);
            });
        } catch (error) {
            console.error("Error during updatring profile photo:", error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    },
    skillsData: (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params
            console.log(req.body);
            UserClient.UpdateSkillsData({
                userId: id, skill: req.body.skill
            }, (err: Error | null, result: any) => {
                if (err) {
                    return res.status(500).json({ error: 'Internal Server Error' });
                }
                return res.json(result);
            });
        } catch (error) {
            console.error("Error during updatring profile photo:", error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    },
    getFollowings: (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params
            console.log(req.body);
            UserClient.GetFollowings({
                userId: id
            }, (err: Error | null, result: any) => {
                if (err) {
                    console.log(err, 'followings');

                    return res.status(500).json({ error: 'Internal Server Error' });
                }
                console.log(result, 'in separete following');
                return res.json(result);
            });
        } catch (error) {
            console.error("Error during updatring profile photo:", error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    },
    follow: (req: Request, res: Response, next: NextFunction) => {
        try {
            console.log('follow');

            const { userId, guestId } = req.params;
            UserClient.FollowUser({ userId, guestId }, (err: Error | null, result: any) => {
                if (err) {
                    return res.status(500).json({ error: 'Internal Server Error' });
                }
                return res.json(result);
            });
        } catch (error) {
            console.error("Error during updatring cover photo:", error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    },
    unfollow: (req: Request, res: Response, next: NextFunction) => {
        try {
            console.log('unfollow');

            const { userId, guestId } = req.params;
            UserClient.UnFollowUser({ userId, guestId }, (err: Error | null, result: any) => {
                if (err) {
                    return res.status(500).json({ error: 'Internal Server Error' });
                }
                return res.json(result);
            });
        } catch (error) {
            console.error("Error during updatring cover photo:", error);
            return res.status(500).json({ error: 'Internal Server Error' });
        }
    },

}
