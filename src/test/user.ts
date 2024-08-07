import { test } from "node:test";
import { strict } from "node:assert";
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { UserModel } from "../models/user.js";
import dotenv from "dotenv";
import { UserPutItem, UserPostItem } from "../type.js";

dotenv.config();

const dbClient = new DynamoDBClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
});
const userModel = new UserModel();
const testUserItem: UserPostItem = {
  id: "testId",
  name: "testName",
  email: "test@email",
};

const UpdatedUserItem: UserPutItem = {
  email: "updated@email",
};

test("Read user", async () => {
  const command = userModel.getItemCommand(testUserItem.id);
  const response = await dbClient.send(command);
  strict.deepStrictEqual(userModel.formatItemFromCommand(response.Item), testUserItem);
  console.log(JSON.stringify(userModel.formatItemFromCommand(response.Item)));
});

test("Update user", async () => {
  const command = userModel.updateItemCommand(testUserItem.id, UpdatedUserItem);
  const response = await dbClient.send(command);
  strict.strictEqual(response.$metadata.httpStatusCode, 200);
  console.log(JSON.stringify(response.$metadata));
});

test("Read updated user", async () => {
  const command = userModel.getItemCommand(testUserItem.id);
  const response = await dbClient.send(command);
  //strict.deepStrictEqual(userModel.formatItemFromCommand(response.Item), UpdatedUserItem);
  console.log(JSON.stringify(response.Item));
});

test("Delete user", async () => {
  const command = userModel.deleteItemCommand(testUserItem.id);
  const response = await dbClient.send(command);
  strict.strictEqual(response.$metadata.httpStatusCode, 200);
  console.log(JSON.stringify(response.$metadata));
});

test("Create user", async () => {
  const command = userModel.postItemCommand(testUserItem);
  const response = await dbClient.send(command);
  strict.strictEqual(response.$metadata.httpStatusCode, 200);
  console.log(JSON.stringify(response.$metadata));
});
