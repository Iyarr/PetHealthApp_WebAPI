import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { getEnv } from "./env.js";

export const createDBClient = () => {
  if (process.env.onAWS) {
    return new DynamoDBClient();
  } else {
    return new DynamoDBClient({
      region: getEnv("AWS_REGION"),
      credentials: {
        accessKeyId: getEnv("AWS_ACCESS_KEY_ID"),
        secretAccessKey: getEnv("AWS_SECRET_ACCESS_KEY"),
      },
    });
  }
};
