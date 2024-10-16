import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { getEnv } from "./env.js";

export const DBClient = process.env.onAWS
  ? new DynamoDBClient()
  : new DynamoDBClient({
      endpoint: getEnv("DYNAMODB_ENDPOINT"),
      region: getEnv("AWS_REGION"),
      credentials: {
        accessKeyId: getEnv("AWS_ACCESS_KEY_ID"),
        secretAccessKey: getEnv("AWS_SECRET_ACCESS_KEY"),
      },
    });
