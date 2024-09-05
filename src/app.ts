import express, { Request, Response } from "express";
import { userRouter } from "./routes/user.js";
import { createDBClient } from "./utils/client.js";
import { getEnv } from "./utils/env.js";

const PORT = getEnv("PORT");
const app = express();

app.set("client", createDBClient());
app.use(express.json());

app.use("/user", userRouter);

app.get("/", (req: Request, res: Response) => {
  const body = req.body;
  res.json(body);
});

app.listen(PORT, () => console.log(`API Server is running on port ${PORT}`));
