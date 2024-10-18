import { Router } from "express";
import { userController } from "../controllers/user.js";

export const userRouter = Router();

userRouter.get("/", userController.read);
userRouter.post("/", userController.create);
userRouter.put("/", userController.update);
userRouter.delete("/", userController.delete);
