import { test } from "node:test";
import { strict } from "node:assert";
import { randomUUID } from "node:crypto";
import { userDogModel } from "../../models/userdog.js";
import { dogModel } from "../../models/dog.js";
import { UserDogsTableItems } from "../../types/userdog.js";
import { dog3Sizes, dogGenders } from "../../common/dogs.js";
import { DescribeTableCommand } from "@aws-sdk/client-dynamodb";
import { DBClient } from "../../utils/dynamodb.js";

const numberOfUser = 40;
const numberOfDogsPerUser = 3;
const numberOfUserDogsPerUser = 10;

const numberOfDogs = numberOfUser * numberOfDogsPerUser;
const numberOfUserDogs = numberOfUser * numberOfUserDogsPerUser;

type TestDogTableItems = {
  id?: number;
  ownerUid: string;
  name: string;
  gender: (typeof dogGenders)[number];
  size: (typeof dog3Sizes)[number];
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

type TestUserDog = {
  user: TestUser;
  dog: TestDog;
  updateItem: { isAccepted: boolean };
};

type TestUser = {
  uid: string;
  invitedDogs: TestDog[];
  acceptedDogs: TestDog[];
};

const testUsers: TestUser[] = [...Array(numberOfUser).keys()].map((i: number) => {
  return {
    uid: randomUUID() as string,
    invitedDogs: [] as TestDog[],
    acceptedDogs: [] as TestDog[],
  };
});

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
  const ownerUid = testUsers[ownerUidIndex].uid;
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

const testUserDogs: TestUserDog[] = [...Array(numberOfUserDogs).keys()].map((i: number) => {
  const user = testUsers[Math.floor(Math.random() * numberOfUser)];
  const uid = user.uid;
  while (true) {
    const dogIndex = Math.floor(Math.random() * numberOfDogs);
    const dog = testDogs[dogIndex];
    const ownerUid = dog.item.ownerUid;
    if (ownerUid !== uid && !dog.invitedUids.includes(uid)) {
      const updateItem = { isAccepted: false };
      dog.invitedUids.push(uid);
      user.invitedDogs.push(dog);
      if (i % 2 === 0) {
        updateItem.isAccepted = true;
        dog.memberUids.push(uid);
        user.acceptedDogs.push(dog);
      }
      return {
        user,
        dog,
        updateItem,
      };
    }
  }
});

await test("UserDog Test", async (t) => {
  await test("Create Dogs for Test", async () => {
    await Promise.all(
      testDogs.map(async (testDog) => {
        const id = await dogModel.postItemCommand<TestDogTableItems>(testDog.item);
        testDog.item.id = id;
      })
    );
    strict.ok(true);
  });

  await test("Create UserDog", async () => {
    await Promise.all(
      testUserDogs.map(async (testUserDog) => {
        try {
          const item = {
            dogId: testUserDog.dog.item.id,
            uid: testUserDog.user.uid,
            ownerUid: testUserDog.dog.item.ownerUid,
            isAccepted: false,
            isAnswered: false,
          };
          await userDogModel.postItemCommand<UserDogsTableItems>(item);
        } catch (e) {
          strict.fail(e);
        }
      })
    );
    strict.ok(true);
  });

  await test("Get Notification", async () => {
    await Promise.all(
      testUsers.map(async (user) => {
        const userdogs = await userDogModel.getNotification(user.uid);
        const dogIds = userdogs.map((userdog) => userdog.dogId);
        const invitedDogIds = user.invitedDogs.map((dog) => dog.item.id);
        strict.deepStrictEqual(dogIds.sort(), invitedDogIds.sort());
      })
    );
  });

  await test("Update UserDog", async () => {
    await Promise.all(
      testUserDogs.map(async (testUserDog) => {
        const item = {
          dogId: testUserDog.dog.item.id,
          uid: testUserDog.user.uid,
          ownerUid: testUserDog.dog.item.ownerUid,
          isAnswered: true,
          ...testUserDog.updateItem,
        };
        await userDogModel.update(item);
      })
    );
    strict.ok(true);
  });

  await test("Get Dogs from Uid", async () => {
    await Promise.all(
      testUsers.map(async (user) => {
        const dogs = await userDogModel.getDogsFromUid(user.uid);
        const dogIds = dogs.map((dog) => dog.dogId);
        const acceptedDogIds = user.acceptedDogs.map((dog) => dog.item.id);
        strict.deepStrictEqual(dogIds.sort(), acceptedDogIds.sort());
      })
    );
  });

  await test("Get Users from DogId", async () => {
    await Promise.all(
      testDogs.map(async (dog) => {
        const users = await userDogModel.getUsersFromDogId(dog.item.id);
        const uids = users.map((user) => user.uid);
        strict.deepStrictEqual(uids.sort(), dog.memberUids.sort());
      })
    );
  });

  await test("Delete UserDog", async () => {
    const [deleteUserdog, ...rest] = testUserDogs;
    try {
      await userDogModel.deleteWithOwnerValidation(
        {
          dogId: deleteUserdog.dog.item.id,
          uid: deleteUserdog.user.uid,
        },
        deleteUserdog.dog.item.ownerUid
      );
      await userDogModel.deleteItemsWithoutOwnerValidation(
        rest.map((userdog) => {
          return {
            dogId: userdog.dog.item.id,
            uid: userdog.user.uid,
          };
        })
      );
    } catch (e) {
      console.log(deleteUserdog);
      strict.fail(e);
    }
  });
});

console.log("Check Table After Test");
await Promise.all(
  [dogModel, userDogModel].map(async (model) => {
    try {
      const command = new DescribeTableCommand({
        TableName: model.tableName,
      });
      const output = await DBClient.send(command);
      console.log(output.Table);
    } catch (e) {
      console.log(e);
    }
  })
);
