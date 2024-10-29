import { test } from "node:test";
import { strict } from "node:assert";
import { DogUpdateItem, DogPostItem } from "../types/dog.js";
import { dogModel } from "../models/dog.js";
import { createDogTable } from "./setup.js";

const testDogItem: DogPostItem = {
  id: "testId",
  name: "testName",
  gender: "male",
  size: "small",
  hostUid: "testDogId",
};

const PutDogItem: DogUpdateItem = {
  size: "medium",
  gender: "female",
};

const UpdatedDogItem = {
  id: "testId",
  name: "testName",
  size: "medium",
  gender: "female",
  hostUid: "testDogId",
};

await createDogTable();

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
    const item = await dogModel.updateItemCommand(testDogItem.id, PutDogItem, testDogItem.hostUid);
    strict.deepStrictEqual(item, UpdatedDogItem);
    console.log(JSON.stringify(item, null, 2));
  });

  await t.test("Read updated dog", async () => {
    const item = await dogModel.getItemCommand({ id: testDogItem.id });
    strict.deepStrictEqual(item, UpdatedDogItem);
    console.log(JSON.stringify(item, null, 2));
  });

  await t.test("Update dog with wrong hostUid", async () => {
    try {
      await dogModel.updateItemCommand(testDogItem.id, PutDogItem, "wronghostUid");
    } catch (e) {
      strict.deepStrictEqual(e.message, "Failed to update item");
    }
  });

  await t.test("Try to create equal id dog", async () => {
    try {
      await dogModel.postItemCommand<DogPostItem>(testDogItem);
    } catch (e) {
      strict.deepStrictEqual(e.message, "Item already exists");
    }
  });

  await t.test("Delete dog", async () => {
    const old_item = await dogModel.deleteItemCommand(testDogItem.id, testDogItem.hostUid);
    console.log(JSON.stringify(old_item, null, 2));
    strict.ok(true);
  });
});
