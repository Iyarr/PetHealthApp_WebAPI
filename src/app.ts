import express, { Request, Response } from "express";
import { dogRouter } from "./routes/dog.js";
import { tokenAuth } from "./middle/auth.js";
import { env } from "./utils/env.js";

const PORT = env.PORT;
const app = express();

app.use(express.json());

app.use(tokenAuth);
app.use("/dog", dogRouter);

app.get("/", (req: Request, res: Response) => {
  const body = req.body;
  res.json(body);
});

app.use((err: Error, req: Request, res: Response) => {
  console.error(err);
  res.status(500).json({ message: "Internal Server Error" });
});

app.listen(PORT, () => console.log(`API Server is running on port ${PORT}`));
