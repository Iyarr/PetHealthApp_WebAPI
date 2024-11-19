import { test } from "node:test";
import { strict } from "node:assert";
import { randomUUID } from "node:crypto";
import { userDogModel } from "../../models/userdog.js";
import { dogModel } from "../../models/dog.js";
import { UserDogsTableItems } from "../../types/userdog.js";
import { DogPOSTRequestBody, DogPUTRequestBody } from "../../types/dog.js";
import { dog3Sizes, dogGenders } from "../../common/dogs.js";
import { userDogsTableItems, userDogsTablePK } from "../../common/dynamodb.js";

const numberOfDataSpecies = 10;
const numberOfUserDogs = 30;
const numberOfVariousTestData = 10;

const sizes = ["small", "medium", "big"];
const genders = ["male", "female"];

type TestDogItem = {
  id: string;
  hostUid: string;
} & DogPOSTRequestBody;

type TestDog = {
  accessibleUsers: string[];
  item: TestDogItem;
  updateItem: DogPUTRequestBody;
};

type TestUserDog = UserDogsTableItems;

const testUsers = [...Array(numberOfDataSpecies).keys()].map((i: number) => {
  return {
    uid: i.toString(),
    // アクセス可能な犬のIDを格納
    accessibleDogIds: [] as string[],
  };
});

const testDogs: TestDog[] = [...Array(numberOfVariousTestData).keys()].map((i: number) => {
  const reqBody: DogPOSTRequestBody = {
    name: i.toString(),
    gender: dogGenders[i % 2],
    size: dog3Sizes[i % 3],
  };
  const id = randomUUID();
  const hostUidIndex = Math.floor(Math.random() * numberOfVariousTestData);
  const hostUid = testUsers[hostUidIndex].uid;
  return {
    // アクセスを許可したユーザーのIDを格納
    accessibleUsers: [] as string[],
    item: {
      id,
      hostUid,
      ...reqBody,
    },
    updateItem: {
      gender: dogGenders[(i + 1) % 2],
      size: dog3Sizes[(i + 1) % 3],
    },
  };
});

const testUserDogs: TestUserDog[] = [...Array(numberOfVariousTestData)].map(() => {
  const user = testUsers[Math.floor(Math.random() * numberOfVariousTestData)];
  const uid = user.uid;
  while (true) {
    const dogIndex = Math.floor(Math.random() * numberOfVariousTestData);
    const dog = testDogs[dogIndex];
    const hostUid = dog.item.hostUid;
    if (hostUid !== uid && !dog.accessibleUsers.includes(uid)) {
      dog.accessibleUsers.push(uid);
      user.accessibleDogIds.push(dog.item.id);
      return {
        uid,
        hostUid,
        dogId: dog.item.id,
        isAccepted: false,
        isAnswered: false,
      };
    }
  }
});

await test("UserDog Test", async (t) => {
  await test("Create Dogs for Test", async () => {
    await Promise.all(
      testDogs.map(async (testDog) => {
        await dogModel.postItemCommand<DogPOSTRequestBody>(testDog.item);
      })
    );
    strict.ok(true);
  });

  await test("Create UserDog", async () => {
    await Promise.all(
      testUserDogs.map(async (testUserDog) => {
        await userDogModel.postItemCommand<UserDogsTableItems>(testUserDog);
      })
    );
    strict.ok(true);
  });

  await test("Get Dogs from Uid", async () => {
    await Promise.all(
      testUsers.map(async (user) => {
        const dogs = await userDogModel.getDogsFromUid(user.uid);
        const dogIds = dogs.map((dog) => dog.dogId);
        strict.deepStrictEqual(dogIds.sort(), user.accessibleDogIds.sort());
      })
    );
  });

  await test("Get Users from DogId", async () => {
    await Promise.all(
      testDogs.map(async (dog) => {
        const users = await userDogModel.getUsersFromDogId(dog.item.id);
        const uids = users.map((user) => user.uid);
        strict.deepStrictEqual(uids.sort(), dog.accessibleUsers.sort());
      })
    );
  });
});
