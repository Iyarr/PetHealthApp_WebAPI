import { DescribeTableCommand, CreateTableCommand } from "@aws-sdk/client-dynamodb";
import { DBClient } from "../utils/dynamodb.js";
import { env } from "../utils/env.js";

export async function createDogTable() {
  const describeTableCommand = new DescribeTableCommand({
    TableName: `${env.TABLE_PREFIX}Dogs`,
  });

  const createTableCommand = new CreateTableCommand({
    AttributeDefinitions: [
      {
        AttributeName: "id",
        AttributeType: "S",
      },
      {
        AttributeName: "hostUid",
        AttributeType: "S",
      },
    ],
    KeySchema: [
      {
        AttributeName: "id",
        KeyType: "HASH",
      },
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: "hostUidIndex",
        KeySchema: [
          {
            AttributeName: "hostUid",
            KeyType: "HASH",
          },
        ],
        Projection: {
          ProjectionType: "ALL",
        },
      },
    ],
    TableName: `${env.TABLE_PREFIX}Dogs`,
    BillingMode: "PAY_PER_REQUEST",
  });

  try {
    const dogTableData = await DBClient.send(describeTableCommand);
    console.log(`status:${dogTableData.$metadata.httpStatusCode}`);
  } catch {
    await DBClient.send(createTableCommand);
  }
}
