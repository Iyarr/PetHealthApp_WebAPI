import { json, Request, Response } from "express";
import { DogPostItem } from "../types/dog.js";
import { dogModel } from "../models/dog.js";

export const dogController = {
  async create(req: Request, res: Response) {
    const dog: DogPostItem = Object.assign({ hostUid: res.locals.uid }, req.body);
    try {
      await dogModel.postItemCommand<DogPostItem>(dog);
      res.status(201).json({ message: "Dog created" });
    } catch (e) {
      res.status(400).json({ message: e.message });
    }
  },

  async read(req: Request, res: Response) {
    try {
      const dog = await dogModel.getItemCommand({ id: req.params.id });
      res.status(200).json({ dog });
    } catch (e) {
      res.status(404).json({ message: "Dog not found" });
    }
  },

  async update(req: Request, res: Response) {
    const dog: DogPostItem = Object.assign({ hostUid: res.locals.uid }, req.body);
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
      res.status(200).json({ message: "Dog deleted" });
    } catch (e) {
      res.status(400).json({ message: e.message });
    }
  },
};
