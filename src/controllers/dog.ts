import { Request, Response } from "express";
import { randomUUID } from "crypto";
import { DogPOSTRequestBody } from "../types/dog.js";
import { dogModel } from "../models/dog.js";
import { userDogModel } from "../models/userdog.js";

export const dogController = {
  async create(req: Request, res: Response) {
    const id = randomUUID();
    const dog: DogPOSTRequestBody = {
      id,
      hostUid: res.locals.uid,
      ...req.body,
    };
    try {
      await dogModel.postItemCommand<DogPOSTRequestBody>(dog);
      res.status(201).json({ message: "Dog created", data: { id } });
    } catch (e) {
      res.status(400).json({ message: e.message });
    }
  },

  async read(req: Request, res: Response) {
    try {
      const dog = await dogModel.getItemCommand({ id: req.params.id });
      res.status(200).json({ message: "OK", data: { dog } });
    } catch (e) {
      res.status(404).json({ message: "Dog not found" });
    }
  },

  async update(req: Request, res: Response) {
    const dog: DogPOSTRequestBody = Object.assign({ hostUid: res.locals.uid }, req.body);
    try {
      const result = await dogModel.updateItemCommand(req.params.id, dog, res.locals.uid);
      if (!result) {
        throw new Error("Dog not found");
      } else {
        res.status(200).json({ message: "Dog updated" });
      }
    } catch (e) {
      //console.log(JSON.stringify(dog, null, 2));
      res.status(400).json({ message: e.message });
    }
  },

  async delete(req: Request, res: Response) {
    try {
      await dogModel.deleteItemCommand(req.params.id, res.locals.uid);
      await userDogModel.deleteUserDogsWithDogId(req.params.id);
      res.status(200).json({ message: "Dog deleted" });
    } catch (e) {
      res.status(400).json({ message: e.message });
    }
  },

  async getMockData(req: Request, res: Response) {
    const mockData = {
      id: "1",
      name: "Pochi",
      gender: "male",
      size: "small",
      hostUid: "user_id"
    };
    res.status(200).json({ message: "OK", data: mockData });
  }
};
