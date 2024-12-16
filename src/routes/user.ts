import { userController } from "../controllers/user.js";
import { Router } from "express";

export const userRouter = Router();

userRouter.get("/dogs", userController.readDogs);
userRouter.get("/notifi", userController.readNotification);
