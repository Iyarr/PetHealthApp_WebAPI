import { test } from "node:test";
import { strict } from "node:assert";
import { userModel } from "../models/user.js";
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

test("Read user", async () => {
  const response = await userModel.getItemCommand({ id: testUserItem.id });
  if (!response) {
    strict.fail("Item not found");
  }
  strict.deepStrictEqual(response, testUserItem);
  console.log(JSON.stringify(response));
});

test("Update user", async () => {
  const response = await userModel.updateItemCommand({ id: testUserItem.id }, PutUserItem);
  console.log(JSON.stringify(response));
});

test("Read updated user", async () => {
  const response = await userModel.getItemCommand({ id: testUserItem.id });
  if (!response) {
    strict.fail("Item not found");
  }
  strict.deepStrictEqual(response, Object.assign({}, testUserItem, PutUserItem));
  console.log(JSON.stringify(response));
});

test("Delete user", async () => {
  const response = await userModel.deleteItemCommand({ id: testUserItem.id });
  strict.strictEqual(response.$metadata.httpStatusCode, 200);
  console.log(JSON.stringify(response.$metadata));
});

test("Create user", async () => {
  const response = await userModel.postItemCommand<UserPostItem>(testUserItem);
  console.log(JSON.stringify(response));
});
