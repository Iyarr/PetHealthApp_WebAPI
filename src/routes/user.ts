import { Router } from "express";
import { userController } from "../controllers/user.js";

export const userRouter = Router();

userRouter.get("/:userId", userController.read);
