import { Request, Response } from "express";
import { userDogModel } from "../models/userdog.js";
import { dogModel } from "../models/dog.js";
import { UserDogsTableItems } from "../types/userdog.js";

export const userController = {
  async readDogs(req: Request, res: Response) {
    try {
      const uid = res.locals.uid as string;
      const userdogs: UserDogsTableItems[] = await userDogModel.getDogsFromUid(uid);
      const dogIds = userdogs.map((userdog) => {
        return { id: userdog.dogId };
      });
      const dogs = await dogModel.batchGetItemCommand(dogIds);
      res.status(200).json({
        message: "OK",
        data: { dogs },
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
