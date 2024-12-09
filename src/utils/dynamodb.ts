import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { env } from "./env.js";

export const DBClient = process.env.ON_DEVELOPMENT
  ? new DynamoDBClient({
      endpoint: env.DYNAMODB_ENDPOINT,
      region: "us-west-2",
      credentials: {
        accessKeyId: "dummyAccessKeyId",
        secretAccessKey: "dummySecretAccessKey",
      },
    })
  : new DynamoDBClient();
