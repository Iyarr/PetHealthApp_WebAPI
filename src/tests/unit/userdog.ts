import { test } from "node:test";
import { strict } from "node:assert";
import { randomUUID } from "node:crypto";
import { userDogModel } from "../../models/userdog.js";
import { dogModel } from "../../models/dog.js";
import { UserDogsTableItems } from "../../types/userdog.js";
import { dog3Sizes, dogGenders } from "../../common/dogs.js";

const numberOfUser = 50;
const numberOfDogsPerUser = 3;
const numberOfUserDogsPerUser = 10;

const numberOfDogs = numberOfUser * numberOfDogsPerUser;
const numberOfUserDogs = numberOfUser * numberOfUserDogsPerUser;

type TestDogTableItems = {
  id: string;
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
  item: UserDogsTableItems;
  updateItem: { isAccepted: boolean };
};

type TestUser = {
  uid: string;
  invitedDogIds: string[];
  acceptedDogIds: string[];
};

const testUsers: TestUser[] = [...Array(numberOfUser).keys()].map((i: number) => {
  return {
    uid: randomUUID() as string,
    invitedDogIds: [] as string[],
    acceptedDogIds: [] as string[],
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
  const id = randomUUID() as string;
  const ownerUidIndex = Math.floor(Math.random() * numberOfUser);
  const ownerUid = testUsers[ownerUidIndex].uid;
  return {
    invitedUids: [] as string[],
    memberUids: [] as string[],
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
      user.invitedDogIds.push(dog.item.id);
      if (i % 2 === 0) {
        updateItem.isAccepted = true;
        dog.memberUids.push(uid);
        user.acceptedDogIds.push(dog.item.id);
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
        await dogModel.postItemCommand<TestDogTableItems>(testDog.item);
      })
    );
    strict.ok(true);
  });

  await test("Create UserDog", async () => {
    await Promise.all(
      testUserDogs.map(async (testUserDog) => {
        try {
          await userDogModel.postItemCommand<UserDogsTableItems>(testUserDog.item);
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
        strict.deepStrictEqual(dogIds.sort(), user.invitedDogIds.sort());
      })
    );
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
        strict.deepStrictEqual(dogIds.sort(), user.acceptedDogIds.sort());
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
          dogId: deleteUserdog.item.dogId,
          uid: deleteUserdog.item.uid,
        },
        deleteUserdog.item.ownerUid
      );
      await userDogModel.deleteItemsWithoutOwnerValidation(
        rest.map((userdog) => {
          return {
            dogId: userdog.item.dogId,
            uid: userdog.item.uid,
          };
        })
      );
    } catch (e) {
      console.log(deleteUserdog);
      strict.fail(e);
    }
  });
});
