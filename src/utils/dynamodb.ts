import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { NodeHttpHandler } from "@smithy/node-http-handler";
import { env } from "./env.js";

export const DBClient = process.env.ON_DEVELOPMENT
  ? new DynamoDBClient({
      endpoint: env.DYNAMODB_ENDPOINT,
      region: "us-west-2",
      credentials: {
        accessKeyId: "dummyAccessKeyId",
        secretAccessKey: "dummySecretAccessKey",
      },
      requestHandler: new NodeHttpHandler({
        httpAgent: { keepAlive: true, maxSockets: 500 },
      }),
    })
  : new DynamoDBClient();
