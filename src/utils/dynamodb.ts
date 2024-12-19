import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { NodeHttpHandler } from "@smithy/node-http-handler";
import { env } from "./env.js";
import { DynamoDB } from "../consts/dynamodb.js";

export const DBClient = process.env.ON_DEVELOPMENT
  ? new DynamoDBClient({
      endpoint: env.DYNAMODB_ENDPOINT,
      region: DynamoDB.Test.Region,
      credentials: {
        accessKeyId: DynamoDB.Test.AccessKeyId,
        secretAccessKey: DynamoDB.Test.SecretAccessKey,
      },
      requestHandler: new NodeHttpHandler({
        httpAgent: { keepAlive: true, maxSockets: 500 },
      }),
    })
  : new DynamoDBClient();
