import express, { Request, Response } from "express";
import { userRouter } from "./routes/user.js";
import { Client } from "./models/client.js";

const app = express();
const client = new Client();

app.set("client", client);
app.use(express.json());

app.use("/user", userRouter);

app.get("/", (req: Request, res: Response) => {
  const body = req.body;
  res.json(body);
});

app.listen(3000, () => console.log("API Server is running on port 3000"));
