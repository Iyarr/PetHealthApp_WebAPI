import { ListTablesCommand, CreateTableCommand } from "@aws-sdk/client-dynamodb";
import { DBClient } from "../utils/dynamodb.js";
import { env } from "../utils/env.js";

export async function createUserDogTable() {
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

export async function createDogTable() {
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

const listTablesCommand = new ListTablesCommand({});
const response = await DBClient.send(listTablesCommand);
console.log(response.TableNames);

if (!response.TableNames.includes(`${env.TABLE_PREFIX}Dogs`)) {
  await createDogTable();
}
if (!response.TableNames.includes(`${env.TABLE_PREFIX}UserDogs`)) {
  await createUserDogTable();
}
