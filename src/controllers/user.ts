import { Request, Response } from "express";
import { userDogModel } from "../models/userdog.js";
import { UserDogsTableItems } from "../types/userdog.js";

export const userController = {
  async readDogIds(req: Request, res: Response) {
    try {
      const uid = res.locals.uid as string;
      const userdogs: UserDogsTableItems[] = await userDogModel.getDogsFromUid(uid);
      res.status(200).json({
        message: "OK",
        data: {
          dogs: userdogs.map((userdog) => userdog.dogId),
        },
      });
    } catch (e) {
      res.status(404).json({ message: "userdogs not found" });
    }
  },

  async readNotification(req: Request, res: Response) {
    try {
      const uid = res.locals.uid as string;
      const userdogs = await userDogModel.getNotification(uid);
      res.status(200).json({
        message: "OK",
        data: {
          userdogs: userdogs.map((userdog) => ({
            dogId: userdog.dogId,
          })),
        },
      });
    } catch (e) {
      res.status(404).json({ message: e.message });
    }
  },
};
