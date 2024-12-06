import { test } from "node:test";
import { strict } from "node:assert";
import { randomUUID } from "crypto";
import { DogPUTRequestBody, DogPOSTRequestBody } from "../../types/dog.js";
import { dogModel } from "../../models/dog.js";

const hostUid = "testDogId";
const id = randomUUID();

const dogPOSTReqBody: DogPOSTRequestBody = {
  name: "testName",
  gender: "male",
  size: "small",
};

const PutDogItem: DogPUTRequestBody = {
  size: "medium",
  gender: "female",
};

const testDogItem = {
  id,
  hostUid,
  ...dogPOSTReqBody,
};

const UpdatedDogItem = {
  ...testDogItem,
  ...PutDogItem,
};

await test("Dog Test", async (t) => {
  await t.test("Create dog", async () => {
    await dogModel.postItemCommand(testDogItem);
    strict.ok(true);
  });

  await t.test("Read dog", async () => {
    const item = await dogModel.getItemCommand({ id });
    strict.deepStrictEqual(item, testDogItem);
  });

  await t.test("Update dog", async () => {
    const item = await dogModel.updateItemCommand(id, PutDogItem, hostUid);
    strict.deepStrictEqual(item, UpdatedDogItem);
  });

  await t.test("Read updated dog", async () => {
    const item = await dogModel.getItemCommand({ id });
    strict.deepStrictEqual(item, UpdatedDogItem);
  });

  await t.test("Update dog with wrong hostUid", async () => {
    try {
      await dogModel.updateItemCommand(id, PutDogItem, "wronghostUid");
    } catch (e) {
      strict.deepStrictEqual(e.message, "The conditional request failed");
    }
  });

  await t.test("Try to create equal id dog", async () => {
    try {
      await dogModel.postItemCommand<DogPOSTRequestBody>(testDogItem);
      strict.fail("Should not update");
    } catch (e) {
      strict.deepStrictEqual(e.message, "The conditional request failed");
    }
  });

  await t.test("Delete dog", async () => {
    await dogModel.deleteItemCommand(id, hostUid);
    strict.ok(true);
  });
});
