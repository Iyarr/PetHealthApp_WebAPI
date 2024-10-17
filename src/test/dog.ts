import { CreateTableCommand, DescribeTableCommand } from "@aws-sdk/client-dynamodb";
import { test } from "node:test";
import { strict } from "node:assert";
import { DogPutItem, DogPostItem } from "../type.js";
import { dogModel } from "../models/dog.js";
import { getEnv } from "../utils/env.js";
import { DBClient } from "../utils/dynamodb.js";

const testDogItem: DogPostItem = {
  id: "testId",
  name: "testName",
  gender: "male",
  size: "small",
  hostId: "testDogId",
};

const PutDogItem: DogPutItem = {
  size: "medium",
  gender: "female",
};

const UpdatedDogItem = {
  id: "testId",
  name: "testName",
  size: "medium",
  gender: "female",
  hostId: "testDogId",
};

const TABLE_PREFIX = getEnv("TABLE_PREFIX");
const describeTableCommand = new DescribeTableCommand({
  TableName: `${TABLE_PREFIX}Dogs`,
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
  TableName: `${TABLE_PREFIX}Dogs`,
  BillingMode: "PAY_PER_REQUEST",
});

try {
  console.log(await DBClient.send(describeTableCommand));
} catch {
  await DBClient.send(createTableCommand);
}

await test("Dog Test", async (t) => {
  await t.test("Create dog", async () => {
    await dogModel.postItemCommand<DogPostItem>(testDogItem);
    strict.ok(true);
  });

  await t.test("Read dog", async () => {
    const item = await dogModel.getItemCommand({ id: testDogItem.id });
    strict.deepStrictEqual(item, testDogItem);
    console.log(JSON.stringify(item));
  });

  await t.test("Update dog", async () => {
    const item = await dogModel.updateItemCommand({ id: testDogItem.id }, PutDogItem);
    strict.deepStrictEqual(item, UpdatedDogItem);
    console.log(JSON.stringify(item));
  });

  await t.test("Read updated dog", async () => {
    const item = await dogModel.getItemCommand({ id: testDogItem.id });
    strict.deepStrictEqual(item, UpdatedDogItem);
    console.log(JSON.stringify(item));
  });

  await t.test("Try to create equal id dog", async () => {
    try {
      await dogModel.postItemCommand<DogPostItem>(testDogItem);
    } catch (e) {
      strict.deepStrictEqual(e.message, "Failed to post item");
    }
  });

  await t.test("Delete dog", async () => {
    const item = await dogModel.deleteItemCommand({ id: testDogItem.id });
    strict.ok(true);
  });
});

console.log(await DBClient.send(describeTableCommand));
