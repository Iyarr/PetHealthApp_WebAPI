import { Request, Response } from "express";
import {
  UserDogPOSTRequestBody,
  UserDogsGETUsersRequestParams,
  UserDogPUTRequestBody,
  UserDogPUTRequestParams,
  UserDogsDELETERequestParams,
  UserDogsTableItems,
} from "../types/userdog.js";
import { userDogModel } from "../models/userdog.js";

export const userdogController = {
  async create(req: Request, res: Response) {
    const userdog = {
      ...(req.body as UserDogPOSTRequestBody),
      ownerUid: res.locals.uid as string,
      isAccepted: false,
      isAnswered: false,
    };
    try {
      await userDogModel.postItemCommand<UserDogsTableItems>(userdog);
      res.status(201).json({ message: "userdog created" });
    } catch (e) {
      res.status(400).json({ message: e.message });
    }
  },

  async readUids(req: Request, res: Response) {
    try {
      const reqParams = req.params as UserDogsGETUsersRequestParams;
      const userdogs = await userDogModel.getUsersFromDogId(reqParams.dogId);
      res
        .status(200)
        .json({ message: "OK", data: { users: userdogs.map((userdog) => userdog.uid) } });
    } catch (e) {
      res.status(404).json({ message: "userdog not found" });
    }
  },

  async update(req: Request, res: Response) {
    const userdog = {
      ...(req.params as UserDogPUTRequestParams),
      ownerUid: res.locals.uid as string,
      ...(req.body as UserDogPUTRequestBody),
      isAnswered: true,
    };
    try {
      await userDogModel.update(userdog);
      res.status(200).json({ message: "userdog updated" });
    } catch (e) {
      res.status(400).json({ message: e.message });
    }
  },

  async delete(req: Request, res: Response) {
    const params = req.params as UserDogsDELETERequestParams;
    const uid = res.locals.uid as string;
    try {
      await userDogModel.deleteWithOwnerValidation(params, uid);
      res.status(200).json({ message: "userdog deleted" });
    } catch (e) {
      res.status(400).json({ message: e.message });
    }
  },
};
