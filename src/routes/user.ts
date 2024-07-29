import { Router } from "express";
import { userController } from "../controllers/user.js";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

export const userRouter = (client: DynamoDBClient) => {
  const userRouter = Router();
  userRouter.get("/:userId", userController.read);
  return userRouter;
};
