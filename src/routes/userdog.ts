import { Router } from "express";
import { userdogController } from "../controllers/userdog.js";

export const userdogRouter = Router();

userdogRouter.post("/", userdogController.create);
userdogRouter.get("/users/:dogId", userdogController.readUids);
userdogRouter.get("/dogs", userdogController.readDogIds);
userdogRouter.put("/:dogId/:uid", userdogController.update);
userdogRouter.delete("/:dogId/:uid", userdogController.delete);
