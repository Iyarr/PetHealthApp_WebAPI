import { Request, Response } from "express";
import { randomUUID } from "crypto";
import { DogPOSTRequestBody } from "../types/dog.js";
import { dogModel } from "../models/dog.js";
import { userDogModel } from "../models/userdog.js";
import { body, validationResult } from "express-validator";
import { dogGenders, dog3Sizes } from "../common/dogs.js";

export const dogController = {
  async create(req: Request, res: Response) {
    const bodys = ["name", "gender", "size"];

    // バリデーションの実行
    await body("name").isString().withMessage("Name must be a string").run(req);
    await body("size")
      .isString()
      .withMessage("Size must be a string")
      .isIn(dog3Sizes)
      .withMessage(`Size must be either ${dog3Sizes.join(" or ")}`)
      .run(req);

    // 許可されていないフィールドのチェック
    for (const field of Object.keys(req.body)) {
      if (!bodys.includes(field)) {
        return res.status(400).json({ message: `Field ${field} is not allowed` });
      }
    }

    // エラーの取得
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: "Bad Request", errors: errors.mapped() });
    }

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
      res.status(200).json({ message: "OK", data: dog });
    } catch (e) {
      res.status(404).json({ message: "Dog not found" });
    }
  },

  async update(req: Request, res: Response) {
    const bodys = ["name", "gender", "size"];

    // バリデーションの実行
    await body("name").optional().isString().withMessage("Name must be a string").run(req);
    await body("size")
      .optional()
      .isString()
      .withMessage("Size must be a string")
      .isIn(dog3Sizes)
      .withMessage(`Size must be either ${dog3Sizes.join(" or ")}`)
      .run(req);

    // 許可されていないフィールドのチェック
    for (const field of Object.keys(req.body)) {
      if (!bodys.includes(field)) {
        return res.status(400).json({ message: `Field ${field} is not allowed` });
      }
    }

    // エラーの取得
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: "Bad Request", errors: errors.mapped() });
    }

    const dog: DogPOSTRequestBody = Object.assign({ hostUid: res.locals.uid }, req.body);
    try {
      const result = await dogModel.updateItemCommand(req.params.id, dog, res.locals.uid);
      if (!result) {
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
      await dogModel.deleteItemCommand(req.params.id, res.locals.uid);
      const userDogs = await userDogModel.getUserDogsPKToDeleteDog(req.params.id);
      if (userDogs.length !== 0) {
        await userDogModel.deleteItemsWithoutOwnerValidation(
          userDogs.map((userDog) => {
            return {
              dogId: req.params.id,
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
