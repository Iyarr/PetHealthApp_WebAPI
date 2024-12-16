import {
  ListTablesCommand,
  CreateTableCommand,
  BatchWriteItemCommand,
} from "@aws-sdk/client-dynamodb";
import { DBClient } from "../utils/dynamodb.js";
import { env } from "../utils/env.js";

async function createUserDogTable() {
  const createTableCommand = new CreateTableCommand({
    AttributeDefinitions: [
      { AttributeName: "uid", AttributeType: "S" },
      { AttributeName: "dogId", AttributeType: "N" },
    ],
    KeySchema: [
      { AttributeName: "uid", KeyType: "HASH" },
      { AttributeName: "dogId", KeyType: "RANGE" },
    ],
    GlobalSecondaryIndexes: [
      {
        IndexName: "uidIndex",
        KeySchema: [{ AttributeName: "uid", KeyType: "HASH" }],
        Projection: { ProjectionType: "ALL" },
      },
      {
        IndexName: "dogIdIndex",
        KeySchema: [{ AttributeName: "dogId", KeyType: "HASH" }],
        Projection: { ProjectionType: "ALL" },
      },
    ],
    TableName: `${env.TABLE_PREFIX}UserDogs`,
    BillingMode: "PAY_PER_REQUEST",
  });

  await DBClient.send(createTableCommand);
}

async function createDogTable() {
  const createTableCommand = new CreateTableCommand({
    AttributeDefinitions: [
      { AttributeName: "id", AttributeType: "N" },
      { AttributeName: "hostUid", AttributeType: "S" },
    ],
    KeySchema: [{ AttributeName: "id", KeyType: "HASH" }],
    GlobalSecondaryIndexes: [
      {
        IndexName: "hostUidIndex",
        KeySchema: [{ AttributeName: "hostUid", KeyType: "HASH" }],
        Projection: { ProjectionType: "ALL" },
      },
    ],
    TableName: `${env.TABLE_PREFIX}Dogs`,
    BillingMode: "PAY_PER_REQUEST",
  });

  await DBClient.send(createTableCommand);
}

async function createIDKeysTable() {
  const tebleName = `${env.TABLE_PREFIX}IDKeys`;
  const createTableCommand = new CreateTableCommand({
    AttributeDefinitions: [{ AttributeName: "tableName", AttributeType: "S" }],
    KeySchema: [{ AttributeName: "tableName", KeyType: "HASH" }],
    TableName: tebleName,
    BillingMode: "PAY_PER_REQUEST",
  });
  await DBClient.send(createTableCommand);

  const setUpCommand = new BatchWriteItemCommand({
    RequestItems: {
      [tebleName]: ["Dogs", "UserDogs"].map((value) => {
        return {
          PutRequest: {
            Item: {
              tableName: { S: `${env.TABLE_PREFIX}${value}` },
              length: { N: "0" },
            },
          },
        };
      }),
    },
  });
  await DBClient.send(setUpCommand);
}

console.log("Checking tables in the database");
const listTablesCommand = new ListTablesCommand({});
const response = await DBClient.send(listTablesCommand);
console.log("Tables in the database:");
console.log(response.TableNames);

if (!response.TableNames.includes(`${env.TABLE_PREFIX}Dogs`)) {
  await createDogTable();
  console.log("Dogs table created");
}
if (!response.TableNames.includes(`${env.TABLE_PREFIX}UserDogs`)) {
  await createUserDogTable();
  console.log("UserDogs table created");
}
if (!response.TableNames.includes(`${env.TABLE_PREFIX}IDKeys`)) {
  await createIDKeysTable();
  console.log("IDKeys table created");
}
