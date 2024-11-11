import { Router } from "express";
import { userdogController } from "../controllers/userdog.js";

export const userdogRouter = Router();

userdogRouter.post("/", userdogController.create);
userdogRouter.get("/dog/:id", userdogController.readUsers);
userdogRouter.get("/user", userdogController.readDogs);
userdogRouter.put("/", userdogController.update);
userdogRouter.delete("/dog/:id/:uid", userdogController.delete);
