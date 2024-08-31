import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import express, { Request, Response } from "express";
import { userRouter } from "./routes/user.js";
import { config } from "dotenv";
import { getEnv } from "./utils.js";

config();
const PORT = getEnv("PORT");
const app = express();
const client = new DynamoDBClient();

app.set("client", client);
app.use(express.json());

app.use("/user", userRouter);

app.get("/", (req: Request, res: Response) => {
  const body = req.body;
  res.json(body);
});

app.listen(PORT, () => console.log(`API Server is running on port ${PORT}`));
