import { Request, Response } from "express";
import { UserDogPostItem } from "../types/userdogs.js";
import { userDogModel } from "../models/userdog.js";

export const userdogController = {
  async create(req: Request, res: Response) {
    const userdog = {
      uid: req.body.uid,
      dogId: req.body.dogId,
      ownerUid: res.locals.uid,
    };
    try {
      await userDogModel.postItemCommand<UserDogPostItem>(userdog);
      res.status(201).json({ message: "userdog created" });
    } catch (e) {
      res.status(400).json({ message: e.message });
    }
  },

  async read(req: Request, res: Response) {
    try {
      const userdog = await userDogModel.getItemCommand({ id: req.params.id });
      res.status(200).json({ userdog });
    } catch (e) {
      res.status(404).json({ message: "userdog not found" });
    }
  },

  async delete(req: Request, res: Response) {
    try {
      await userDogModel.deleteUserDog(req.params.id, res.locals.uid);
      res.status(200).json({ message: "userdog deleted" });
    } catch (e) {
      res.status(400).json({ message: e.message });
    }
  },
};
