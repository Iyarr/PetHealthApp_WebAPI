import express, { Request, Response } from "express";
import { dogRouter } from "./routes/dog.js";
import { userRouter } from "./routes/user.js";
import { userdogRouter } from "./routes/userdog.js";
import { tokenAuth } from "./middle/auth.js";
import { env } from "./utils/env.js";
import { API } from "./consts/api.js";

const PORT = env.PORT;
const app = express();

app.use(express.json());

app.use(tokenAuth);
app.use("/dog", dogRouter);
app.use("/user", userRouter);
app.use("/userdog", userdogRouter);

app.use("/", (req: Request, res: Response) => {
  console.log(req.path, req.method);
  res.status(404).json({ message: API.Message.Error[404] });
});

app.use((err: Error, req: Request, res: Response) => {
  console.error("エラー！", err);
  res.status(500).json({ message: API.Message.Error[500] });
});

app.listen(PORT, () => console.log(API.Message.Start + PORT));
