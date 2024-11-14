import { test } from "node:test";
import { strict } from "node:assert";
import { randomUUID } from "node:crypto";
import { userDogModel } from "../../models/userdog.js";
import { dogModel } from "../../models/dog.js";
import { UserDogPOSTRequestBody } from "../../types/userdog.js";
import { DogPOSTRequestBody } from "../../types/dog.js";

const randomDataNum = 10;
const testDataMax = 30;

const sizes = ["small", "medium", "big"];
const genders = ["male", "female"];

const testUsers = [...Array(randomDataNum).keys()].map((i: number) => {
  return {
    uid: i.toString(),
    // アクセス可能な犬のIDを格納
    accessibleDogIds: [],
  };
});

const testDogs = [...Array(randomDataNum).keys()].map((i: number) => {
  const reqBody: DogPOSTRequestBody = {
    name: i.toString(),
    gender: genders[i % 2],
    size: sizes[i % 3],
  };
  const id = randomUUID();
  const hostUid = Math.floor(Math.random() * randomDataNum).toString();
  return {
    // アクセスを許可したユーザーを格納
    accessibleUsers: [],
    item: {
      id,
      hostUid,
      ...reqBody,
    },
  };
});

const testUserDogItems = [...Array(testDataMax)].map(() => {
  const uid = testUsers[Math.floor(Math.random() * randomDataNum)].uid;
  while (true) {
    const index = Math.floor(Math.random() * randomDataNum);
    if (testDogs[index].item.hostUid !== uid) {
      testDogs[index].accessibleUsers.push(uid);
      testUsers[uid].accessibleDogIds.push(testDogs[index].item.id);

      return {
        uid,
        dogId: testDogs[index].item.id,
        hostUid: testDogs[index].item.hostUid,
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
      testUserDogItems.map(async (testUserDogItem) => {
        await userDogModel.postItemCommand<UserDogPOSTRequestBody>(testUserDogItem);
      })
    );
    strict.ok(true);
  });
  /*
  await test("Get Dogs from Uid", async () => {
    await Promise.all(
      testUsers.map(async (user) => {
        const userDogs = await userDogModel.getDogsFromUid(user.uid);
        console.log(userDogs);
        strict.deepStrictEqual(userDogs, user.accessibleDogIds);
      })
    );
  });
  /*
  await test("Get Users from DogId", async () => {
    await Promise.all(
      testDogs.map(async (dog) => {
        const users = await userDogModel.getUsersFromDogId(dog.item.id);
        strict.deepStrictEqual(users, dog.accessibleUsers);
      })
    );
  });
*/
});
