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
import { API } from "../consts/api.js";

export const userdogController = {
  async create(req: Request, res: Response) {
    const params = {
      ...req.body,
      dogId: Number(req.body.dogId),
    };
    const userdog = {
      ...params,
      ownerUid: res.locals.uid as string,
      isAccepted: false,
      isAnswered: false,
    };
    try {
      await userDogModel.postItemCommand<UserDogsTableItems>(userdog);
      res.status(201).json({ message: API.Message.Success[201] });
    } catch (e) {
      res.status(400).json({ message: e.message });
    }
  },

  async readUids(req: Request, res: Response) {
    const params = {
      ...req.params,
      dogId: Number(req.params.dogId),
    };
    try {
      const userdogs = await userDogModel.getUsersFromDogId(params.dogId);
      res.status(200).json({
        message: API.Message.Success[200],
        data: { users: userdogs.map((userdog) => userdog.uid) },
      });
    } catch (e) {
      res.status(404).json({ message: "userdog not found" });
    }
  },

  async update(req: Request, res: Response) {
    const userdog = {
      uid: req.params.uid,
      dogId: Number(req.params.dogId),
      ownerUid: res.locals.uid as string,
      ...(req.body as UserDogPUTRequestBody),
      isAnswered: true,
    };
    try {
      await userDogModel.update(userdog);
      res.status(200).json({ message: API.Message.Success[200] });
    } catch (e) {
      res.status(400).json({ message: e.message });
    }
  },

  async delete(req: Request, res: Response) {
    const params = {
      ...(req.params as UserDogsDELETERequestParams),
      dogId: Number(req.params.dogId),
    };
    const uid = res.locals.uid as string;
    try {
      await userDogModel.deleteWithOwnerValidation(params, uid);
      res.status(200).json({ message: API.Message.Success[200] });
    } catch (e) {
      res.status(400).json({ message: e.message });
    }
  },
};
