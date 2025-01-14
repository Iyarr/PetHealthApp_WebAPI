import { test } from "node:test";
import { deepStrictEqual, strict } from "node:assert";
import {
  DogModelItemInput,
  DogsTablePK,
  DogsTableAttributes,
  DogsTableItems,
} from "../../types/dog.js";
import { dogModel } from "../../models/dog.js";
import { DescribeTableCommand } from "@aws-sdk/client-dynamodb";
import { DBClient } from "../../utils/dynamodb.js";
import {
  dogsTableItems,
  dogsTablePK,
  dogsTableAttributes,
  dogsTableNumberAttributes,
  dogsTableStringAttributes,
} from "../../common/dynamodb.js";

const numberOfUser = 10;
const numberOfDogsPerUser = 10;

type TestDogTableItems = Partial<DogsTablePK> & DogModelItemInput;

type TestDog = {
  invitedUids: string[];
  memberUids: string[];
  item: TestDogTableItems;
  updateItem: {
    name?: string;
    genderId?: string;
    sizeId?: string;
  };
};

const numberOfDogs = numberOfUser * numberOfDogsPerUser;

const uids = [...Array(numberOfUser).keys()].map((i: number) => i.toString());

const testDogs: TestDog[] = [...Array(numberOfDogs).keys()].map((i: number) => {
  const reqBody: {
    name: string;
    genderId: string;
    sizeId: string;
  } = {
    name: i.toString(),
    genderId: (i % 2).toString(),
    sizeId: (i % 3).toString(),
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
      genderId: ((i + 1) % 2).toString(),
      sizeId: ((i + 1) % 3).toString(),
    },
  };
});

for (const testDog of testDogs) {
  for (const key of dogsTableAttributes) {
    if (testDog.item[key] === undefined) {
      throw new Error(`Key ${key} is not defined`);
    }
  }
}

await test("Dog Test", async (t) => {
  await t.test("Create dog", async () => {
    await Promise.all(
      testDogs.map(async (testDog) => {
        const id = await dogModel.postItemCommand(testDog.item);
        testDog.item.id = id;
        strict.ok(id);
      })
    );
  });

  await t.test("Read dog", async () => {
    await Promise.all(
      testDogs.map(async (testDog) => {
        const item = await dogModel.getItemCommand<DogsTablePK, DogsTableItems>({
          id: testDog.item.id,
        });
        dogsTablePK.forEach((key) => {
          strict.deepStrictEqual(item[key], Number(testDog.item[key]));
        });
        dogsTableNumberAttributes.forEach((key) => {
          strict.deepStrictEqual(item[key], Number(testDog.item[key]));
        });
        dogsTableStringAttributes.forEach((key) => {
          strict.deepStrictEqual(item[key], testDog.item[key]);
        });
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
        const updateItem = { ...testDog.item, ...testDog.updateItem };
        dogsTablePK.forEach((key) => {
          strict.deepStrictEqual(output[key], Number(updateItem[key]));
        });
        dogsTableNumberAttributes.forEach((key) => {
          strict.deepStrictEqual(output[key], Number(updateItem[key]));
        });
        dogsTableStringAttributes.forEach((key) => {
          strict.deepStrictEqual(output[key], updateItem[key]);
        });
      })
    );
  });

  await t.test("Read updated dog", async () => {
    await Promise.all(
      testDogs.map(async (testDog) => {
        const output = await dogModel.getItemCommand<DogsTablePK, DogsTableItems>({
          id: testDog.item.id,
        });

        const updateItem = { ...testDog.item, ...testDog.updateItem };
        dogsTablePK.forEach((key) => {
          strict.deepStrictEqual(output[key], Number(updateItem[key]));
        });
        dogsTableNumberAttributes.forEach((key) => {
          strict.deepStrictEqual(output[key], Number(updateItem[key]));
        });
        dogsTableStringAttributes.forEach((key) => {
          strict.deepStrictEqual(output[key], updateItem[key]);
        });
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
        const output = await dogModel.deleteItemCommand(testDog.item.id, testDog.item.ownerUid);

        const updateItem = { ...testDog.item, ...testDog.updateItem };
        dogsTablePK.forEach((key) => {
          strict.deepStrictEqual(output[key], Number(updateItem[key]));
        });
        dogsTableNumberAttributes.forEach((key) => {
          strict.deepStrictEqual(output[key], Number(updateItem[key]));
        });
        dogsTableStringAttributes.forEach((key) => {
          strict.deepStrictEqual(output[key], updateItem[key]);
        });
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
