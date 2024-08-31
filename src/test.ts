import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { config } from "dotenv";
import { getEnv } from "./utils.js";

config();

export const dbClient = new DynamoDBClient({
  region: getEnv("AWS_REGION"),
  credentials: {
    accessKeyId: getEnv("AWS_ACCESS_KEY_ID"),
    secretAccessKey: getEnv("AWS_SECRET_ACCESS_KEY"),
  },
});
