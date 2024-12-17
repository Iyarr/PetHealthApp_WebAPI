import { Request, Response } from "express";
import { DogPOSTRequestBody, DogPUTRequestBody } from "../types/dog.js";
import { dogModel } from "../models/dog.js";
import { userDogModel } from "../models/userdog.js";

export const dogController = {
  async create(req: Request, res: Response) {
    const dog: DogPOSTRequestBody = {
      ownerUid: res.locals.uid,
      ...req.body,
    };
    try {
      const id = await dogModel.postItemCommand<DogPOSTRequestBody>(dog);
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
    const dog: DogPUTRequestBody = req.body;
    const id = Number(req.params.id);
    const ownerUid = res.locals.uid;
    try {
      const updatedItem = await dogModel.updateItemCommand(id, dog, ownerUid);
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

  async getMockData(req: Request, res: Response) {                //モック作成
    const mockData = {
      id: "1",
      name: "Pochi",
      gender: "male",
      size: "small",
      hostUid: "user_id"
    };
    console.log("Mock Data Response:", mockData);
    res.status(200).json({ message: "OK", data: mockData });
  
  }
};
