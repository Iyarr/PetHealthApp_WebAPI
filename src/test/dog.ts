import { test } from "node:test";
import { strict } from "node:assert";
import { DogPutItem, DogPostItem } from "../type.js";
import { DogModel } from "../models/dog.js";
import { createDBClient } from "../utils/client.js";

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

const dogModel = new DogModel();
const dbClient = createDBClient();

test("Create dog", async () => {
  const command = dogModel.postItemCommand(testDogItem);
  const response = await dbClient.send(command);
  strict.strictEqual(response.$metadata.httpStatusCode, 200);
  console.log(JSON.stringify(response.$metadata));
});

test("Read dog", async () => {
  const command = dogModel.getItemCommand(testDogItem.id);
  const response = await dbClient.send(command);
  if (!response.Item) {
    strict.fail("Item not found");
  }
  strict.deepStrictEqual(dogModel.formatItemFromCommand(response.Item), testDogItem);
  console.log(JSON.stringify(dogModel.formatItemFromCommand(response.Item)));
});

test("Update dog", async () => {
  const command = dogModel.updateItemCommand(testDogItem.id, PutDogItem);
  const response = await dbClient.send(command);
  strict.strictEqual(response.$metadata.httpStatusCode, 200);
  console.log(JSON.stringify(response.$metadata));
});

test("Read updated dog", async () => {
  const command = dogModel.getItemCommand(testDogItem.id);
  const response = await dbClient.send(command);
  if (!response.Item) {
    strict.fail("Item not found");
  }
  strict.deepStrictEqual(
    dogModel.formatItemFromCommand(response.Item),
    Object.assign(testDogItem, PutDogItem)
  );
  console.log(JSON.stringify(dogModel.formatItemFromCommand(response.Item)));
});

test("Delete dog", async () => {
  const command = dogModel.deleteItemCommand(testDogItem.id);
  const response = await dbClient.send(command);
  strict.strictEqual(response.$metadata.httpStatusCode, 200);
  console.log(JSON.stringify(response.$metadata));
});
