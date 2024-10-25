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
        AttributeName: "hostId",
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
        IndexName: "hostIdIndex",
        KeySchema: [
          {
            AttributeName: "hostId",
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
    console.log(JSON.stringify(dogTableData, null, 2));
  } catch {
    await DBClient.send(createTableCommand);
  }
}

export async function createUserTable() {
  const describeTableCommand = new DescribeTableCommand({
    TableName: `${env.TABLE_PREFIX}Users`,
  });

  const createTableCommand = new CreateTableCommand({
    AttributeDefinitions: [
      {
        AttributeName: "uid",
        AttributeType: "S",
      },
    ],
    KeySchema: [
      {
        AttributeName: "uid",
        KeyType: "HASH",
      },
    ],
    TableName: `${env.TABLE_PREFIX}Users`,
    BillingMode: "PAY_PER_REQUEST",
  });

  try {
    const userTableData = await DBClient.send(describeTableCommand);
    console.log(JSON.stringify(userTableData, null, 2));
  } catch {
    await DBClient.send(createTableCommand);
  }
}
