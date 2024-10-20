import { Request, Response } from "express";
import { DogPostItem } from "../types/dog.js";
import { dogModel } from "../models/dog.js";

export const dogController = {
  async create(req: Request, res: Response) {
    const dog: DogPostItem = Object.assign({ hostId: res.locals.uid }, req.body);
    await dogModel.postItemCommand<DogPostItem>(dog);
    res.status(201).json({ message: "Dog created" });
  },

  async read(req: Request, res: Response) {
    try {
      const dog = await dogModel.getItemCommand({ hostId: res.locals.uid });
      res.status(200).json(dog);
    } catch (e) {
      res.status(404).json({ message: "Dog not found" });
    }
  },

  async update(req: Request, res: Response) {
    await dogModel.updateItemCommand({ hostId: res.locals.uid }, req.body);
    res.status(200).json({ message: "Dog updated" });
  },

  async delete(req: Request, res: Response) {
    await dogModel.deleteItemCommand({ hostId: res.locals.uid });
    res.status(200).json({ message: "Dog deleted" });
  },
};
