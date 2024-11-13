import { test } from "node:test";
import { strict } from "node:assert";
import { randomUUID } from "node:crypto";
import { userDogModel } from "../../models/userdog.js";
import { dogModel } from "../../models/dog.js";
import { UserDogPOSTRequestBody } from "../../types/userdog.js";
import { DogPOSTRequestBody } from "../../types/dog.js";

const userNum = 4;
const dogNum = 4;

const sizes = {
  0: "small",
  1: "medium",
  2: "big",
};
const genders = {
  0: "male",
  1: "female",
};

const testUids = Array(userNum).map((i: number) => `testUid${i}`);
const testDogItems = Array(dogNum).map((i: number) => {
  const reqBody: DogPOSTRequestBody = {
    name: `testName${i}`,
    gender: genders[i % 2],
    size: sizes[i % 3],
  };
  const id = randomUUID();
  const hostUid = `testUid${i / 2}`;
  return {
    id,
    hostUid,
    ...reqBody,
  };
});

const testUserDogItems: UserDogPOSTRequestBody[] = [
  {
    dogId: testDogItems[0].id,
    uid: testUids[1],
  },
  {
    dogId: testDogItems[1].id,
    uid: testUids[1],
  },
  {
    dogId: testDogItems[1].id,
    uid: testUids[2],
  },
  {
    dogId: testDogItems[2].id,
    uid: testUids[2],
  },
];

await test("UserDog Test", async (t) => {
  await test("Create Dogs for Test", async () => {
    Promise.all(
      testDogItems.map(async (testDogItem) => {
        await dogModel.postItemCommand<DogPOSTRequestBody>(testDogItem);
      })
    ).then(() => strict.ok(true));
  });

  await test("Create UserDog", async () => {
    Promise.all(
      testUserDogItems.map((testUserDogItem) =>
        userDogModel.postItemCommand<UserDogPOSTRequestBody>(testUserDogItem)
      )
    ).then(() => strict.ok(true));
  });

  await test("Get Dogs from Uid", async () => {
    Promise.all(
      testUids.map(async (uid) => {
        const userDogs = await userDogModel.getDogsFromUid(uid);
        strict.ok(true);
      })
    );
  });

  await test("Get Users from DogId", async () => {
    Promise.all(
      testDogItems.map(async (dogItem) => {
        const users = await userDogModel.getUsersFromDogId(dogItem.id);
        strict.ok(true);
      })
    );
  });
});
