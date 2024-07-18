import express, { Request, Response } from "express";
import { userRouter } from "./routes/user.js";

const app = express();
app.use(express.json());
app.use("/user", userRouter);

app.get("/", (req: Request, res: Response) => {
  const body = req.body;
  res.json(body);
});

app.listen(3000, () => console.log("API Server is running on port 3000"));
