import { ListTablesCommand, CreateTableCommand } from "@aws-sdk/client-dynamodb";
import { DBClient } from "../utils/dynamodb.js";
import { env } from "../utils/env.js";

async function createUserDogTable() {
  const createTableCommand = new CreateTableCommand({
    AttributeDefinitions: [
      { AttributeName: "uid", AttributeType: "S" },
      { AttributeName: "dogId", AttributeType: "S" },
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
      { AttributeName: "id", AttributeType: "S" },
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

async function createDiaryTable() {
  const createTableCommand = new CreateTableCommand({
    AttributeDefinitions: [
      { AttributeName: "dogId", AttributeType: "S" },
      { AttributeName: "date", AttributeType: "S" },
    ],
    KeySchema: [
      { AttributeName: "dogId", KeyType: "HASH" },
      { AttributeName: "date", KeyType: "RANGE" },
    ],
    TableName: `${env.TABLE_PREFIX}Diaries`,
    BillingMode: "PAY_PER_REQUEST",
  });

  await DBClient.send(createTableCommand);
}

async function createItemTable() {
  const createTableCommand = new CreateTableCommand({
    AttributeDefinitions: [{ AttributeName: "id", AttributeType: "S" }],
    KeySchema: [{ AttributeName: "id", KeyType: "HASH" }],
    TableName: `${env.TABLE_PREFIX}Items`,
    BillingMode: "PAY_PER_REQUEST",
  });

  await DBClient.send(createTableCommand);
}

async function createOptionTable() {
  const createTableCommand = new CreateTableCommand({
    AttributeDefinitions: [
      { AttributeName: "itemId", AttributeType: "S" },
      { AttributeName: "optionId", AttributeType: "S" },
    ],
    KeySchema: [
      { AttributeName: "itemId", KeyType: "HASH" },
      { AttributeName: "optionId", KeyType: "RANGE" },
    ],
    TableName: `${env.TABLE_PREFIX}Options`,
    BillingMode: "PAY_PER_REQUEST",
  });

  await DBClient.send(createTableCommand);
}
const listTablesCommand = new ListTablesCommand({});
const response = await DBClient.send(listTablesCommand);
console.log(response.TableNames);

if (!response.TableNames.includes(`${env.TABLE_PREFIX}Dogs`)) {
  await createDogTable();
}
if (!response.TableNames.includes(`${env.TABLE_PREFIX}UserDogs`)) {
  await createUserDogTable();
}
if (!response.TableNames.includes(`${env.TABLE_PREFIX}Diaries`)) {
  await createDiaryTable();
}
if (!response.TableNames.includes(`${env.TABLE_PREFIX}Items`)) {
  await createItemTable();
}
if (!response.TableNames.includes(`${env.TABLE_PREFIX}Options`)) {
  await createOptionTable();
}
