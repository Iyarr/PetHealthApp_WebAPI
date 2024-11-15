import { Request, Response } from "express";
import {
  UserDogPOSTRequestBody,
  UserDogsGETUsersRequestParams,
  UserDogPUTRequestBody,
  UserDogPUTRequestParams,
  UserDogsDELETERequestParams,
} from "../types/userdog.js";
import { userDogModel } from "../models/userdog.js";

export const userdogController = {
  async create(req: Request, res: Response) {
    const userdog = { ...(req.body as UserDogPOSTRequestBody), ownerUid: res.locals.uid };
    try {
      await userDogModel.postItemCommand<UserDogPOSTRequestBody>(userdog);
      res.status(201).json({ message: "userdog created" });
    } catch (e) {
      res.status(400).json({ message: e.message });
    }
  },

  async readUsers(req: Request, res: Response) {
    try {
      const reqParams = req.params as UserDogsGETUsersRequestParams;
      const userdog = await userDogModel.getUsersFromDogId(reqParams.dogId);
      res.status(200).json({ userdog });
    } catch (e) {
      res.status(404).json({ message: "userdog not found" });
    }
  },

  async readDogs(req: Request, res: Response) {
    try {
      const reqParams = req.params as {};
      const userdogs = await userDogModel.getDogsFromUid(res.locals.uid);
      res.status(200).json({ userdogs });
    } catch (e) {
      res.status(404).json({ message: "userdogs not found" });
    }
  },

  async update(req: Request, res: Response) {
    const userdog = {
      ...(req.params as UserDogPUTRequestParams),
      ownerUid: res.locals.uid,
      ...(req.body as UserDogPUTRequestBody),
    };
    try {
      await userDogModel.update(req.params.id, res.locals.uid, req.body.isAccepted);
      res.status(200).json({ message: "userdog updated" });
    } catch (e) {
      res.status(400).json({ message: e.message });
    }
  },

  async delete(req: Request, res: Response) {
    try {
      await userDogModel.delete(req.params as UserDogsDELETERequestParams, res.locals.uid);
      res.status(200).json({ message: "userdog deleted" });
    } catch (e) {
      res.status(400).json({ message: e.message });
    }
  },
};
