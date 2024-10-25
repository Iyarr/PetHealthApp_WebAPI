import { Router } from "express";
import { dogController } from "../controllers/dog.js";

export const dogRouter = Router();

dogRouter.post("/", dogController.create);
dogRouter.get("/:id", dogController.read);
dogRouter.put("/:id", dogController.update);
dogRouter.delete("/:id", dogController.delete);
