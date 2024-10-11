import express, { Request, Response } from "express";
import { userRouter } from "./routes/user.js";
import { tokenAuth } from "./middle/auth.js";
import { getEnv } from "./utils/env.js";

const PORT = getEnv("PORT");
const app = express();

app.use(express.json());

app.use("/user", userRouter);
app.use(tokenAuth);

app.get("/", (req: Request, res: Response) => {
  const body = req.body;
  res.json(body);
});

app.use((err: Error, req: Request, res: Response) => {
  console.error(err);
  res.status(500).json({ message: "Internal Server Error" });
});

app.listen(PORT, () => console.log(`API Server is running on port ${PORT}`));
