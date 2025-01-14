import { Router } from "express";
import { diaryController } from "../controllers/diary.js";

export const diaryRouter = Router();

diaryRouter.post("/dog/:dogId/date/:date", diaryController.create);
diaryRouter.get("/dog/:dogId/date/:date", diaryController.read);
diaryRouter.get("/month/:year/:month", diaryController.readMonth);
diaryRouter.put("/dog/:dogId/date/:date", diaryController.update);
diaryRouter.delete("/dog/:dogId/date/:date", diaryController.delete);
