import { test } from "node:test";
import { strict } from "node:assert";
import { UserModel } from "../models/user.js";
import { UserPutItem, UserPostItem } from "../type.js";
import { DBClient } from "../utils/dynamodb.js";

const userModel = new UserModel();
const testUserItem: UserPostItem = {
  id: "testId",
  name: "testName",
  email: "test@email",
};

const PutUserItem: UserPutItem = {
  email: "updated@email",
};

test("Read user", async () => {
  const command = userModel.getItemCommand({ id: testUserItem.id });
  const response = await DBClient.send(command);
  if (!response.Item) {
    strict.fail("Item not found");
  }
  strict.deepStrictEqual(userModel.formatItemFromCommand(response.Item), testUserItem);
  console.log(JSON.stringify(userModel.formatItemFromCommand(response.Item)));
});

test("Update user", async () => {
  const command = userModel.updateItemCommand({ id: testUserItem.id }, PutUserItem);
  const response = await DBClient.send(command);
  strict.strictEqual(response.$metadata.httpStatusCode, 200);
  console.log(JSON.stringify(response.$metadata));
});

test("Read updated user", async () => {
  const command = userModel.getItemCommand({ id: testUserItem.id });
  const response = await DBClient.send(command);
  if (!response.Item) {
    strict.fail("Item not found");
  }
  strict.deepStrictEqual(
    userModel.formatItemFromCommand(response.Item),
    Object.assign({}, testUserItem, PutUserItem)
  );
  console.log(JSON.stringify(userModel.formatItemFromCommand(response.Item)));
});

test("Delete user", async () => {
  const command = userModel.deleteItemCommand({ id: testUserItem.id });
  const response = await DBClient.send(command);
  strict.strictEqual(response.$metadata.httpStatusCode, 200);
  console.log(JSON.stringify(response.$metadata));
});

test("Create user", async () => {
  const command = userModel.postItemCommand<UserPostItem>(testUserItem);
  const response = await DBClient.send(command);
  strict.strictEqual(response.$metadata.httpStatusCode, 200);
  console.log(JSON.stringify(response.$metadata));
});
