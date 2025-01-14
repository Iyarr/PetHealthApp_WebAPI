import { Request, Response } from "express";
import { DogPOSTRequestBody, DogPUTRequestParams, DogPUTRequestBody } from "../types/dog.js";
import { dogModel } from "../models/dog.js";
import { userDogModel } from "../models/userdog.js";

export const dogController = {
  async create(req: Request, res: Response) {
    const body = req.body as DogPOSTRequestBody;
    try {
      const id = await dogModel.postItemCommand(body);
      res.status(201).json({ message: "Dog created", data: { id } });
    } catch (e) {
      res.status(400).json({ message: e.message });
    }
  },

  async read(req: Request, res: Response) {
    try {
      const dog = await dogModel.getItemCommand({ id: Number(req.params.id) });
      res.status(200).json({ message: "OK", data: { dog } });
    } catch (e) {
      res.status(404).json({ message: "Dog not found" });
    }
  },

  async update(req: Request, res: Response) {
    const body = req.body as DogPUTRequestBody;
    const params = req.params as DogPUTRequestParams;
    const ownerUid = res.locals.uid as string;
    try {
      const updatedItem = await dogModel.updateItemCommand(Number(params.id), body, ownerUid);
      if (!updatedItem) {
        throw new Error("Dog not found");
      } else {
        res.status(200).json({ message: "Dog updated" });
      }
    } catch (e) {
      res.status(400).json({ message: e.message });
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const dogId = Number(req.params.id);
      await dogModel.deleteItemCommand(dogId, res.locals.uid);
      const userDogs = await userDogModel.getUserDogsPKToDeleteDog(dogId);
      if (userDogs.length !== 0) {
        await userDogModel.deleteItemsWithoutOwnerValidation(
          userDogs.map((userDog) => {
            return {
              dogId: dogId,
              uid: userDog.uid,
            };
          })
        );
      }
      res.status(200).json({ message: "Dog deleted" });
    } catch (e) {
      res.status(400).json({ message: e.message });
    }
  },
};
