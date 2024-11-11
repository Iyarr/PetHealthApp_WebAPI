import { test } from "node:test";
import { strict } from "node:assert";
import { randomUUID } from "crypto";
import { DogPUTRequestBody, DogPOSTRequestBody } from "../../types/dog.js";
import { dogModel } from "../../models/dog.js";

const hostUid = "testDogId";
const id = randomUUID();

const testDogItem: DogPOSTRequestBody = {
  name: "testName",
  gender: "male",
  size: "small",
};

const PutDogItem: DogPUTRequestBody = {
  size: "medium",
  gender: "female",
};

const UpdatedDogItem = {
  ...testDogItem,
  ...PutDogItem,
  ...{ hostUid },
};

await test("Dog Test", async (t) => {
  await t.test("Create dog", async () => {
    await dogModel.postItemCommand({
      hostUid,
      id,
      ...testDogItem,
    });
    strict.ok(true);
  });

  await t.test("Read dog", async () => {
    const item = await dogModel.getItemCommand({ id });
    strict.deepStrictEqual(item, { ...testDogItem, id, hostUid });
    console.log(JSON.stringify(item, null, 2));
  });

  await t.test("Update dog", async () => {
    const item = await dogModel.updateItemCommand(id, PutDogItem, hostUid);
    strict.deepStrictEqual(item, UpdatedDogItem);
    console.log(JSON.stringify(item, null, 2));
  });

  await t.test("Read updated dog", async () => {
    const item = await dogModel.getItemCommand({ id });
    strict.deepStrictEqual(item, UpdatedDogItem);
    console.log(JSON.stringify(item, null, 2));
  });

  await t.test("Update dog with wrong hostUid", async () => {
    try {
      await dogModel.updateItemCommand(id, PutDogItem, "wronghostUid");
    } catch (e) {
      strict.deepStrictEqual(e.message, "Failed to update item");
    }
  });

  await t.test("Try to create equal id dog", async () => {
    try {
      await dogModel.postItemCommand<DogPOSTRequestBody>(testDogItem);
    } catch (e) {
      strict.deepStrictEqual(e.message, "Item already exists");
    }
  });

  await t.test("Delete dog", async () => {
    const old_item = await dogModel.deleteItemCommand(id, hostUid);
    console.log(JSON.stringify(old_item, null, 2));
    strict.ok(true);
  });
});
