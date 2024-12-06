import { userController } from "../controllers/user.js";
import { Router } from "express";

export const userRouter = Router();

userRouter.get("/dogs", userController.readDogIds);
userRouter.get("/notifi", userController.readNotification);
