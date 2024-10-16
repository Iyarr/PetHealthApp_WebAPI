import { test } from "node:test";
import { strict } from "node:assert";
import { DogPutItem, DogPostItem } from "../type.js";
import { dogModel } from "../models/dog.js";
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

test("Create dog", async () => {
  const response = await dogModel.postItemCommand<DogPostItem>(testDogItem);
  console.log(JSON.stringify(response));
});

test("Read dog", async () => {
  const responseItem = await dogModel.getItemCommand({ id: testDogItem.id });
  if (!responseItem) {
    strict.fail("Item not found");
  }
  strict.deepStrictEqual(responseItem, testDogItem);
  console.log(JSON.stringify(responseItem));
});

test("Update dog", async () => {
  const response = await dogModel.updateItemCommand({ id: testDogItem.id }, PutDogItem);
  console.log(JSON.stringify(response));
});

test("Read updated dog", async () => {
  const response = await dogModel.getItemCommand({ id: testDogItem.id });
  if (!response) {
    strict.fail("Item not found");
  }
  strict.deepStrictEqual(response, Object.assign(testDogItem, PutDogItem));
  console.log(JSON.stringify(response));
});

test("Delete dog", async () => {
  const response = await dogModel.deleteItemCommand({ id: testDogItem.id });
  strict.strictEqual(response.$metadata.httpStatusCode, 200);
  console.log(JSON.stringify(response));
});
