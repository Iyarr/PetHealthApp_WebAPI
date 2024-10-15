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
/*
test("Read user", async () => {
  const response = await userModel.getItemCommand({ id: testUserItem.id });
  if (!response.Item) {
    strict.fail("Item not found");
  }
  strict.deepStrictEqual(userModel.formatItemFromCommand(response.Item), testUserItem);
  console.log(JSON.stringify(userModel.formatItemFromCommand(response.Item)));
});

test("Update user", async () => {
  const response = await userModel.updateItemCommand({ id: testUserItem.id }, PutUserItem);
  strict.strictEqual(response.$metadata.httpStatusCode, 200);
  console.log(JSON.stringify(response.$metadata));
});

test("Read updated user", async () => {
  const response = userModel.getItemCommand({ id: testUserItem.id });
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
  const response = userModel.deleteItemCommand({ id: testUserItem.id });
  strict.strictEqual(response.$metadata.httpStatusCode, 200);
  console.log(JSON.stringify(response.$metadata));
});

test("Create user", async () => {
  const response = userModel.postItemCommand<UserPostItem>(testUserItem);
  strict.strictEqual(response.$metadata.httpStatusCode, 200);
  console.log(JSON.stringify(response.$metadata));
}); */
