import { Request, Response } from "express";
import { randomUUID } from "crypto";
import { diaryModel } from "../models/diary.js";
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

export const diaryController = {
  async create(req: Request, res: Response) {
    const params = req.params as DiaryPOSTRequestParams;
    const body = req.body as DiaryPOSTRequestBody;
    res.status(201).json({ message: "created" });
  },

  async read(req: Request, res: Response) {
    const params = req.params as DiaryGETRequestParams;
    const output = await diaryModel.getItemCommand(params);
    res.status(200).json({
      message: "OK",
      data: output,
    });
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
    res.status(200).json({ message: "OK" });
  },

  async delete(req: Request, res: Response) {
    const params = req.params as DiaryDELETERequestParams;
    await diaryModel.deleteItemCommand(params);
    res.status(200).json({ message: "OK" });
  },
};
