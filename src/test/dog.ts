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

/*
test("Create dog", async () => {
  const command = dogModel.postItemCommand<DogPostItem>(testDogItem);
  const response = await DBClient.send(command);
  strict.strictEqual(response.$metadata.httpStatusCode, 200);
  console.log(JSON.stringify(response.$metadata));
});

test("Read dog", async () => {
  const command = dogModel.getItemCommand({ id: testDogItem.id });
  const response = await DBClient.send(command);
  if (!response.Item) {
    strict.fail("Item not found");
  }
  strict.deepStrictEqual(dogModel.formatItemFromCommand(response.Item), testDogItem);
  console.log(JSON.stringify(dogModel.formatItemFromCommand(response.Item)));
});

test("Update dog", async () => {
  const command = dogModel.updateItemCommand({ id: testDogItem.id }, PutDogItem);
  const response = await DBClient.send(command);
  strict.strictEqual(response.$metadata.httpStatusCode, 200);
  console.log(JSON.stringify(response.$metadata));
});

test("Read updated dog", async () => {
  const command = dogModel.getItemCommand({ id: testDogItem.id });
  const response = await DBClient.send(command);
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
  const command = dogModel.deleteItemCommand({ id: testDogItem.id });
  const response = await DBClient.send(command);
  strict.strictEqual(response.$metadata.httpStatusCode, 200);
  console.log(JSON.stringify(response.$metadata));
}); */
