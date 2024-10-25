import { test } from "node:test";
import { strict } from "node:assert";
import { userModel } from "../models/user.js";
import { UserUpdateItem, UserPostItem } from "../types/user.js";
import { createUserTable } from "./setup.js";

const testUserItem: UserPostItem = {
  uid: "firebaseUid",
  id: "testId",
  name: "testName",
  email: "test@email",
};

const PutUserItem: UserUpdateItem = {
  email: "updated@email",
};

const UpdatedUserItem = {
  uid: "firebaseUid",
  id: "testId",
  name: "testName",
  email: "updated@email",
};

await createUserTable();

await test("User Test", async (t) => {
  await t.test("Create user", async () => {
    await userModel.postItemCommand<UserPostItem>(testUserItem);
    strict.ok(true);
  });

  await t.test("Read user", async () => {
    const item = await userModel.getItemCommand({ uid: testUserItem.uid });
    strict.deepStrictEqual(item, testUserItem);
    console.log(JSON.stringify(item, null, 2));
  });

  await t.test("Update user", async () => {
    const new_item = await userModel.updateItemCommand({ uid: testUserItem.uid }, PutUserItem);
    strict.deepStrictEqual(new_item, UpdatedUserItem);
  });

  await t.test("Read updated user", async () => {
    const item = await userModel.getItemCommand({ uid: testUserItem.uid });
    strict.deepStrictEqual(item, UpdatedUserItem);
    console.log(JSON.stringify(item, null, 2));
  });

  await t.test("Try to create equal uid user", async () => {
    try {
      await userModel.postItemCommand<UserPostItem>(testUserItem);
    } catch (e) {
      strict.deepStrictEqual(e.message, "Item already exists");
    }
  });

  await t.test("Delete user", async () => {
    const old_item = await userModel.deleteItemCommand({ uid: testUserItem.uid });
    console.log(JSON.stringify(old_item, null, 2));
    strict.ok(true);
  });
});
