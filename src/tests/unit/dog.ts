import { describe, test } from "node:test";
import { deepStrictEqual, strict } from "node:assert";
import { DogPOSTRequestBody } from "../../types/dog.js";
import { dog3Sizes, dogGenders } from "../../common/dogs.js";
import { dogModel } from "../../models/dog.js";
import { DescribeTableCommand, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { DBClient } from "../../utils/dynamodb.js";
import { env } from "../../utils/env.js";

const numberOfUser = 10;
const numberOfDogsPerUser = 10;

type TestDogTableItems = {
  id?: number;
  ownerUid: string;
  name: string;
  size: (typeof dog3Sizes)[number];
  gender: (typeof dogGenders)[number];
};

type TestDog = {
  invitedUids: string[];
  memberUids: string[];
  item: TestDogTableItems;
  updateItem: {
    name?: string;
    gender?: (typeof dogGenders)[number];
    size?: (typeof dog3Sizes)[number];
  };
};

const numberOfDogs = numberOfUser * numberOfDogsPerUser;

const uids = [...Array(numberOfUser).keys()].map((i: number) => i.toString());

const testDogs: TestDog[] = [...Array(numberOfDogs).keys()].map((i: number) => {
  const reqBody: {
    name: string;
    gender: (typeof dogGenders)[number];
    size: (typeof dog3Sizes)[number];
  } = {
    name: i.toString(),
    gender: dogGenders[i % 2],
    size: dog3Sizes[i % 3],
  };
  const ownerUidIndex = Math.floor(Math.random() * numberOfUser);
  const ownerUid = uids[ownerUidIndex];
  return {
    invitedUids: [] as string[],
    memberUids: [] as string[],
    item: {
      ownerUid,
      ...reqBody,
    },
    updateItem: {
      gender: dogGenders[(i + 1) % 2],
      size: dog3Sizes[(i + 1) % 3],
    },
  };
});

await test("Dog Test", async (t) => {
  await t.test("Create dog", async () => {
    await Promise.all(
      testDogs.map(async (testDog) => {
        const id = await dogModel.postItemCommand<DogPOSTRequestBody>(testDog.item);
        testDog.item.id = id;
        strict.ok(id);
      })
    );
  });

  await t.test("Read dog", async () => {
    await Promise.all(
      testDogs.map(async (testDog) => {
        const item = await dogModel.getItemCommand({ id: testDog.item.id });
        strict.deepStrictEqual(item, testDog.item);
      })
    );
  });

  await t.test("Update dog", async () => {
    await Promise.all(
      testDogs.map(async (testDog) => {
        const output = await dogModel.updateItemCommand(
          testDog.item.id,
          testDog.updateItem,
          testDog.item.ownerUid
        );
        strict.deepStrictEqual(output, { ...testDog.item, ...testDog.updateItem });
      })
    );
  });

  await t.test("Read updated dog", async () => {
    await Promise.all(
      testDogs.map(async (testDog) => {
        const item = await dogModel.getItemCommand({ id: testDog.item.id });
        strict.deepStrictEqual(item, { ...testDog.item, ...testDog.updateItem });
      })
    );
  });

  await t.test("Update dog with wrong hostUid", async () => {
    await Promise.all(
      testDogs.map(async (testDog) => {
        try {
          await dogModel.updateItemCommand(testDog.item.id, testDog.updateItem, "wronghostUid");
        } catch (e) {
          strict.deepStrictEqual(e.message, "The conditional request failed");
        }
      })
    );
  });

  await test("PK Increment Test", async () => {
    const length = await dogModel.getPKIncrement();
    const describeTableCommand = new DescribeTableCommand({
      TableName: dogModel.tableName,
    });
    const output = await DBClient.send(describeTableCommand);
    deepStrictEqual(length, output.Table.ItemCount);
  });

  await t.test("Delete dog", async () => {
    await Promise.all(
      testDogs.map(async (testDog) => {
        const item = await dogModel.deleteItemCommand(testDog.item.id, testDog.item.ownerUid);
        strict.deepStrictEqual(item, { ...testDog.item, ...testDog.updateItem });
      })
    );
  });
});

console.log("Check Table After Test");
try {
  const command = new DescribeTableCommand({
    TableName: dogModel.tableName,
  });
  const output = await DBClient.send(command);
  console.log(output.Table);
} catch (e) {
  console.log(e);
}
