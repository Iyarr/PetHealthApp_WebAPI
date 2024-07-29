import express, { Request, Response } from "express";
import { userRouter } from "./routes/user.js";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";

const app = express();
const client = new DynamoDBClient();
app.use(express.json());
app.use("/user", userRouter(client));

app.get("/", (req: Request, res: Response) => {
  const body = req.body;
  res.json(body);
});

app.listen(3000, () => console.log("API Server is running on port 3000"));
