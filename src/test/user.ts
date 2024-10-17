import { CreateTableCommand, DescribeTableCommand } from "@aws-sdk/client-dynamodb";
import { test } from "node:test";
import { strict } from "node:assert";
import { userModel } from "../models/user.js";
import { getEnv } from "../utils/env.js";
import { DBClient } from "../utils/dynamodb.js";
import { UserPutItem, UserPostItem } from "../type.js";

const testUserItem: UserPostItem = {
  uid: "firebaseUid",
  id: "testId",
  name: "testName",
  email: "test@email",
};

const PutUserItem: UserPutItem = {
  email: "updated@email",
};

const UpdatedUserItem = {
  uid: "firebaseUid",
  id: "testId",
  name: "testName",
  email: "updated@email",
};

const TABLE_PREFIX = getEnv("TABLE_PREFIX");
const describeTableCommand = new DescribeTableCommand({
  TableName: `${TABLE_PREFIX}Users`,
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
  TableName: `${TABLE_PREFIX}Users`,
  BillingMode: "PAY_PER_REQUEST",
});

try {
  console.log(await DBClient.send(describeTableCommand));
} catch {
  await DBClient.send(createTableCommand);
}

await test("User Test", async (t) => {
  await t.test("Create user", async () => {
    await userModel.postItemCommand<UserPostItem>(testUserItem);
    strict.ok(true);
  });

  await t.test("Read user", async () => {
    const item = await userModel.getItemCommand({ uid: testUserItem.uid });
    strict.deepStrictEqual(item, testUserItem);
  });

  await t.test("Update user", async () => {
    const new_item = await userModel.updateItemCommand({ uid: testUserItem.uid }, PutUserItem);
    strict.deepStrictEqual(new_item, UpdatedUserItem);
  });

  await t.test("Read updated user", async () => {
    const item = await userModel.getItemCommand({ uid: testUserItem.uid });
    strict.deepStrictEqual(item, UpdatedUserItem);
  });

  await t.test("Try to create equal uid user", async () => {
    try {
      await userModel.postItemCommand<UserPostItem>(testUserItem);
    } catch (e) {
      strict.deepStrictEqual(e.message, "Failed to post item");
    }
  });

  await t.test("Delete user", async () => {
    const old_item = await userModel.deleteItemCommand({ uid: testUserItem.uid });
    strict.ok(true);
  });
});

console.log(await DBClient.send(describeTableCommand));
