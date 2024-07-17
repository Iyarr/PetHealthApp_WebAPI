import { Router } from "express";

export const userRouter = Router();

userRouter.route("/:userId").get((req, res) => {
  res.json({ message: `got user ${req.params.userId}` });
});
