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
  DiariesTableItems,
  DiariesTablePK,
  DiaryItemsTablePK,
  DiaryItemsTableAttributes,
  DiaryItemsTableItems,
} from "../types/diary.js";

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
    for (const userdog of userDogs) {
      if (userdog.dogId !== Number(params.dogId) && userdog.ownerUid !== res.locals.uid) {
        continue;
      }
      const diary = await diaryModel.getItemCommand<DiariesTablePK, DiariesTableItems>({
        dogId: Number(params.dogId),
        date: params.date,
      });
      const diaryItems = await diaryItemModel.batchGetItemCommand<
        DiaryItemsTablePK,
        DiaryItemsTableItems
      >(
        diary.itemIds.map((itemId) => {
          return { id: itemId };
        })
      );
      const diaryItemsObject: { [index: number]: DiaryItemsTableAttributes } = {};
      diaryItems.forEach((diaryItem) => {
        diaryItemsObject[diaryItem.id] = {
          detailId: diaryItem.detailId,
          optionId: diaryItem.optionId,
        };
      });
      res.status(200).json({
        message: "OK",
        data: {
          dogId: Number(params.dogId),
          date: diary.date,
          memo: diary.memo,
          createdUid: diary.createdUid,
          items: diary.itemIds.map((item) => {
            return diaryItemsObject[item];
          }),
        },
      });
      return;
    }
    res.status(404).json({ message: "Not Found" });
  },

  async readMonth(req: Request, res: Response) {
    const params = req.params as DiaryGETMonthRequestParams;
    const uid = res.locals.uid;
    // 変更権限のある犬かどうかを確認
    const userdogs = await userDogModel.getDogsFromUid(uid);
    const is_permitted = () => {
      for (const userDog of userdogs) {
        if (userDog.ownerUid === uid || userDog.uid === uid) {
          return true;
        }
      }
      return false;
    };
    if (!is_permitted) {
      res.status(404).json({ message: "Not Found" });
    }
    const diaries = await diaryModel.getDiariesFromDogIdAndMonth(
      Number(params.dogId),
      Number(params.year),
      Number(params.month)
    );
    const itemIds = diaries.map((diary) => diary.itemIds).flat();
    const diaryItems = await diaryItemModel.batchGetItemCommand<
      DiaryItemsTablePK,
      DiaryItemsTableItems
    >(
      itemIds.map((itemId) => {
        return { id: itemId };
      })
    );
    const diaryItemsObject: { [index: number]: DiaryItemsTableAttributes } = {};
    diaryItems.forEach((diaryItem) => {
      diaryItemsObject[diaryItem.id] = {
        detailId: diaryItem.detailId,
        optionId: diaryItem.optionId,
      };
    });

    const data = {
      dogId: Number(params.dogId),
      diaries: diaries.map((diary) => {
        return {
          date: diary.date,
          memo: diary.memo,
          createdUid: diary.createdUid,
          items: diary.itemIds.map((item) => {
            return diaryItemsObject[item];
          }),
        };
      }),
    };

    res.status(200).json({ message: "OK", data });
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
