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
  const dogTableData = await DBClient.send(describeTableCommand);
  console.log(JSON.stringify(dogTableData, null, 2));
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
    console.log(JSON.stringify(item, null, 2));
  });

  await t.test("Update dog", async () => {
    const item = await dogModel.updateItemCommand({ id: testDogItem.id }, PutDogItem);
    strict.deepStrictEqual(item, UpdatedDogItem);
    console.log(JSON.stringify(item, null, 2));
  });

  await t.test("Read updated dog", async () => {
    const item = await dogModel.getItemCommand({ id: testDogItem.id });
    strict.deepStrictEqual(item, UpdatedDogItem);
    console.log(JSON.stringify(item, null, 2));
  });

  await t.test("Try to create equal id dog", async () => {
    try {
      await dogModel.postItemCommand<DogPostItem>(testDogItem);
    } catch (e) {
      strict.deepStrictEqual(e.message, "Item already exists");
    }
  });

  await t.test("Delete dog", async () => {
    const old_item = await dogModel.deleteItemCommand({ id: testDogItem.id });
    console.log(JSON.stringify(old_item, null, 2));
    strict.ok(true);
  });
});

const dogTableData = await DBClient.send(describeTableCommand);
console.log(JSON.stringify(dogTableData, null, 2));
