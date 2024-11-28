import { test } from "node:test";
import { strict } from "node:assert";
import { randomUUID } from "node:crypto";
import { userDogModel } from "../../models/userdog.js";
import { dogModel } from "../../models/dog.js";
import { UserDogsTableItems } from "../../types/userdog.js";
import { DogPOSTRequestBody, DogPUTRequestBody } from "../../types/dog.js";
import { dog3Sizes, dogGenders } from "../../common/dogs.js";

const numberOfVariousTestData = 30;

type TestDogItem = {
  id: string;
  ownerUid: string;
} & DogPOSTRequestBody;

type TestDog = {
  accessibleUsers: string[];
  item: TestDogItem;
  updateItem: DogPUTRequestBody;
};

type TestUserDog = {
  item: UserDogsTableItems;
  updateItem: { isAccepted: boolean };
};

const testUsers = [...Array(numberOfVariousTestData).keys()].map((i: number) => {
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
  const ownerUidIndex = Math.floor(Math.random() * numberOfVariousTestData);
  const ownerUid = testUsers[ownerUidIndex].uid;
  return {
    // アクセスを許可したユーザーのIDを格納
    accessibleUsers: [] as string[],
    item: {
      id,
      ownerUid,
      ...reqBody,
    },
    updateItem: {
      gender: dogGenders[(i + 1) % 2],
      size: dog3Sizes[(i + 1) % 3],
    },
  };
});

const testUserDogs: TestUserDog[] = [...Array(numberOfVariousTestData)].map((i: number) => {
  const user = testUsers[Math.floor(Math.random() * numberOfVariousTestData)];
  const uid = user.uid;
  while (true) {
    const dogIndex = Math.floor(Math.random() * numberOfVariousTestData);
    const dog = testDogs[dogIndex];
    const ownerUid = dog.item.ownerUid;
    if (ownerUid !== uid && !dog.accessibleUsers.includes(uid)) {
      const updateItem = { isAccepted: false };
      if (i % 2) {
        updateItem.isAccepted = true;
        dog.accessibleUsers.push(uid);
        user.accessibleDogIds.push(dog.item.id);
      }
      return {
        item: {
          uid,
          ownerUid,
          dogId: dog.item.id,
          isAccepted: false,
          isAnswered: false,
        },
        updateItem: {
          uid,
          dogId: dog.item.id,
          ...updateItem,
        },
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
        await userDogModel.postItemCommand<UserDogsTableItems>(testUserDog.item);
      })
    );
    strict.ok(true);
  });

  await test("Update UserDog", async () => {
    await Promise.all(
      testUserDogs.map(async (testUserDog) => {
        await userDogModel.update({ ...testUserDog.item, ...testUserDog.updateItem });
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

  await test("Delete UserDog by DogId", async () => {
    await Promise.all(
      testDogs.map(async (dog) => {
        await userDogModel.deleteUserDogsWithDogId(dog.item.id);
        const output = await userDogModel.getUsersFromDogId(dog.item.id);
        strict.deepStrictEqual(output.length, 0);
      })
    );
  });
});
