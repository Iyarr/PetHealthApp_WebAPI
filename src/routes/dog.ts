import { Router } from "express";
import { dogController } from "../controllers/dog.js";

export const dogRouter = Router();

dogRouter.post("/", dogController.create);
dogRouter.get("/", dogController.read);
dogRouter.put("/", dogController.update);
dogRouter.delete("/", dogController.delete);
