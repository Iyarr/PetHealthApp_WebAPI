import { Request, Response } from "express";
import { diaryModel } from "../models/diary.js";
import { diaryItemModel } from "../models/diaryitem.js";
import { userDogModel } from "../models/userdog.js";
import {
  DiaryPOSTRequestBody,
  DiaryPOSTRequestParams,
  DiaryGETRequestParams,
  DiaryGETMonthRequestParams,
  DiaryPUTRequestParams,
  DiaryPUTRequestBody,
  DiaryDELETERequestParams,
} from "../types/diary.js";
import { diaryItemDetailsTableAttributes } from "../common/dynamodb.js";

export const diaryController = {
  async create(req: Request, res: Response) {
    const params = req.params as DiaryPOSTRequestParams;
    const body = req.body as DiaryPOSTRequestBody;
    const userDogs = await userDogModel.getDogsFromUid(res.locals.uid);
    userDogs.forEach(async (userdog) => {
      if (userdog.dogId === Number(params.dogId) || userdog.ownerUid === res.locals.uid) {
        const itemId = await diaryItemModel.postItem(body);
        await diaryModel.postItemCommand({ ...body, itemId: itemId });
        res.status(201).json({ message: "created" });
        return;
      }
    });
    res.status(404).json({ message: "Not Found" });
  },

  async read(req: Request, res: Response) {
    const params = req.params as DiaryGETRequestParams;
    const userDogs = await userDogModel.getDogsFromUid(res.locals.uid);
    userDogs.forEach(async (userdog) => {
      if (userdog.dogId === Number(params.dogId) || userdog.ownerUid === res.locals.uid) {
        const output = await diaryModel.getItemCommand({ id: Number(params.dogId) });
        res.status(200).json({
          message: "OK",
          data: output,
        });
        return;
      }
    });
    res.status(404).json({ message: "Not Found" });
  },

  async readMonth(req: Request, res: Response) {
    const params = req.params as DiaryGETMonthRequestParams;
    const uid = res.locals.uid;
    const monthDate = new Date(Number(params.year), Number(params.month) - 1);
    const nextMonthDate = new Date(Number(params.year), Number(params.month));

    const userdog = await userDogModel.getDogsFromUid(uid);
    res.status(200).json({ message: "OK" });
  },

  async update(req: Request, res: Response) {
    const params = req.params as DiaryPUTRequestParams;
    const body = req.body as DiaryPUTRequestBody;
    const userDogs = await userDogModel.getDogsFromUid(res.locals.uid);
    userDogs.forEach(async (userdog) => {
      if (userdog.dogId === Number(params.dogId) || userdog.ownerUid === res.locals.uid) {
        await diaryModel.putItemCommand(body);
        res.status(200).json({ message: "OK" });
        return;
      }
    });
    res.status(404).json({ message: "Not Found" });
  },

  async delete(req: Request, res: Response) {
    const params = req.params as DiaryDELETERequestParams;
    const userDogs = await userDogModel.getDogsFromUid(res.locals.uid);
    userDogs.forEach(async (userdog) => {
      if (userdog.dogId === Number(params.dogId) || userdog.ownerUid === res.locals.uid) {
        await diaryModel.deleteItemCommand(params);
        res.status(200).json({ message: "OK" });
        return;
      }
    });
    res.status(404).json({ message: "Not Found" });
  },
};
