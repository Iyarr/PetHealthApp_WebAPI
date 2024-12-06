import { test } from "node:test";
import { strict } from "node:assert";
import { initializeApp } from "firebase/app";
import { randomUUID } from "node:crypto";
import { getAuth, createUserWithEmailAndPassword, UserCredential } from "firebase/auth";
import { dogGenders, dog3Sizes } from "../common/dogs.js";
import { DogPUTRequestBody, DogPOSTRequestBody } from "../types/dog.js";
import {
  UserDogPOSTRequestBody,
  UserDogsGETDogsResponseBody,
  UserDogsGETUsersResponseBody,
} from "../types/userdog.js";
import { env } from "../utils/env.js";

const app = initializeApp({
  apiKey: env.FIREBASE_API_KEY,
  projectId: env.FIREBASE_PROJECT_ID,
});

type TestUser = {
  user: UserCredential;
  invitedDogIds: string[];
  acceptedDogIds: string[];
  item: { uid: string; email: string; password: string };
  token: string;
};

type TestDog = {
  memberUids: string[];
  invitedUids: string[];
  item: {
    id?: string;
    hostUid?: string;
  } & DogPOSTRequestBody;
  hostUser: TestUser;
  updateItem: DogPUTRequestBody;
};

type TestUserDog = {
  user: TestUser;
  hostUser: TestUser;
  dog: TestDog;
  updateItem: { isAccepted: boolean };
};

// 多すぎるとFirebase Authの制限に引っかかる
const numberOfUser = 4;
const numberOfDogsPerUser = 3;
const numberOfUserDogsPerUser = 6;

const numberOfDogs = numberOfUser * numberOfDogsPerUser;
const numberOfUserDogs = numberOfUser * numberOfUserDogsPerUser;

const auth = getAuth(app);
// 一時的なアカウント作成用のランダム文字列を生成
const testUsers: TestUser[] = await Promise.all(
  [...Array(numberOfUser).keys()].map(async () => {
    const email = `${Math.random().toString()}@example.com`;
    const password = randomUUID();
    const user = await createUserWithEmailAndPassword(auth, email, password);
    const token = await user.user.getIdToken();

    return {
      user,
      invitedDogIds: [],
      acceptedDogIds: [],
      item: {
        uid: user.user.uid,
        email,
        password,
      },
      token,
    };
  })
);

const testDogs: TestDog[] = [...Array(numberOfDogs).keys()].map((i: number) => {
  const reqBody: DogPOSTRequestBody = {
    name: i.toString(),
    gender: dogGenders[i % dogGenders.length],
    size: dog3Sizes[i % dog3Sizes.length],
  };
  const hostUidIndex = Math.floor(Math.random() * testUsers.length);
  const hostUid = testUsers[hostUidIndex].user.user.uid;
  return {
    // 招待したユーザーのIDを格納
    invitedUids: [],
    memberUids: [],
    item: {
      hostUid,
      ...reqBody,
    },
    // UserのtokenやacceptedDogIdsにアクセスするのに必要
    hostUser: testUsers[hostUidIndex],
    updateItem: {
      gender: dogGenders[(i + 1) % dogGenders.length],
      size: dog3Sizes[(i + 1) % dog3Sizes.length],
    },
  };
});

const testUserDogs: TestUserDog[] = [...Array(numberOfUserDogs).keys()].map((i: number) => {
  const user = testUsers[Math.floor(Math.random() * testUsers.length)];
  const uid = user.item.uid;
  while (true) {
    const dog = testDogs[Math.floor(Math.random() * testDogs.length)];
    const hostUser = dog.hostUser;
    if (hostUser.item.uid !== uid && !dog.invitedUids.includes(uid)) {
      dog.invitedUids.push(uid);
      return {
        user,
        hostUser,
        dog,
        updateItem: { isAccepted: i % 2 === 0 },
      };
    }
  }
});

const headers = (token: string) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
});

await test("Dog API Test", async () => {
  const url = `http://localhost:${env.PORT}`;
  await test("Dog post Test", async () => {
    await Promise.all(
      testDogs.map(async (testDog) => {
        const response = await fetch(`${url}/dog`, {
          method: "POST",
          headers: headers(testDog.hostUser.token),
          body: JSON.stringify(testDog.item),
        });
        const responseJson = await response.json();
        // Dogデータ作成後にidを取得
        testDog.item.id = responseJson.data.id;
        strict.deepStrictEqual(201, response.status);
      })
    );
  });

  await test("UserDog post to prepare", async () => {
    await Promise.all(
      testUserDogs.map(async (testUserDog) => {
        const item: UserDogPOSTRequestBody = {
          uid: testUserDog.user.item.uid,
          dogId: testUserDog.dog.item.id,
        };
        const response = await fetch(`${url}/userdog`, {
          method: "POST",
          headers: headers(testUserDog.hostUser.token),
          body: JSON.stringify(item),
        });
        strict.deepStrictEqual(201, response.status);
      })
    );
  });

  await test("Dog get Test", async () => {
    await Promise.all(
      testDogs.map(async (testDog) => {
        const response = await fetch(`${url}/dog/${testDog.item.id}`, {
          method: "GET",
          headers: headers(testDog.hostUser.token),
        });
        const resBody = await response.json();
        strict.deepStrictEqual(resBody.data.dog, testDog.item);
      })
    );
  });
  await test("Dog put Test", async () => {
    await Promise.all(
      testDogs.map(async (testDog) => {
        const response = await fetch(`${url}/dog/${testDog.item.id}`, {
          method: "PUT",
          headers: headers(testDog.hostUser.token),
          body: JSON.stringify(testDog.updateItem),
        });
        const data = await response.json();
        strict.deepStrictEqual(data.message, "Dog updated");
      })
    );
  });
  await test("Dog read after put Test", async () => {
    await Promise.all(
      testDogs.map(async (testDog) => {
        const response = await fetch(`${url}/dog/${testDog.item.id}`, {
          method: "GET",
          headers: headers(testDog.hostUser.token),
        });
        const resBody = await response.json();
        strict.deepStrictEqual(resBody.data.dog, {
          ...testDog.item,
          ...testDog.updateItem,
          id: testDog.item.id,
        });
      })
    );
  });
  await test("Userdog read before Dog delete Test", async () => {
    await Promise.all(
      testDogs.map(async (testDog) => {
        const response = await fetch(`${url}/userdog/users/${testDog.item.id}`, {
          method: "GET",
          headers: headers(testDog.hostUser.token),
        });
        const resBody = await response.json();
        strict.deepStrictEqual(resBody.data.users, testDog.memberUids);
      })
    );
  });
  await test("Dog delete Test", async () => {
    await Promise.all(
      testDogs.map(async (testDog) => {
        try {
          const response = await fetch(`${url}/dog/${testDog.item.id}`, {
            method: "DELETE",
            headers: headers(testDog.hostUser.token),
          });
          const data = await response.json();
          strict.deepStrictEqual(data.message, "Dog deleted");
        } catch (e) {
          strict.fail(e);
        }
      })
    );
  });
  await test("UserDog read after Dog deleted Test", async () => {
    await Promise.all(
      testDogs.map(async (testDog) => {
        const response = await fetch(`${url}/userdog/users/${testDog.item.id}`, {
          method: "GET",
          headers: headers(testDog.hostUser.token),
        });
        const resBody = await response.json();
        strict.deepStrictEqual(resBody.data.users, []);
      })
    );
  });
});

await test("UserDogs API Test", async () => {
  const url = `http://localhost:${env.PORT}`;
  await test("Dog post to prepare", async () => {
    await Promise.all(
      testDogs.map(async (testDog) => {
        const response = await fetch(`${url}/dog`, {
          method: "POST",
          headers: headers(testDog.hostUser.token),
          body: JSON.stringify(testDog.item),
        });
        const responseJson = await response.json();
        testDog.item.id = responseJson.data.id;
        strict.deepStrictEqual(response.status, 201);
      })
    );
  });
  await test("UserDogs post Test", async () => {
    await Promise.all(
      testUserDogs.map(async (testUserDog) => {
        const item = {
          dogId: testUserDog.dog.item.id,
          uid: testUserDog.user.item.uid,
        };
        if (testUserDog.updateItem.isAccepted) {
          testUserDog.user.acceptedDogIds.push(testUserDog.dog.item.id);
          testUserDog.dog.memberUids.push(testUserDog.user.item.uid);
        }
        const response = await fetch(`${url}/userdog`, {
          method: "POST",
          headers: headers(testUserDog.hostUser.token),
          body: JSON.stringify(item),
        });
        if (response.status !== 201) {
          console.log(await response.json());
        }
        strict.deepStrictEqual(response.status, 201);
      })
    );
  });

  await test("UserDogs get Notification Test", async () => {
    await Promise.all(
      testUsers.map(async (user) => {
        const response = await fetch(`${url}/userdog/notifi`, {
          method: "GET",
          headers: headers(user.token),
        });
        const resBody = await response.json();
        const dogIds = resBody.data.userdogs.map((userdog: { dogId: string }) => userdog.dogId);
        strict.deepStrictEqual(dogIds.sort(), user.acceptedDogIds.sort());
      })
    );
  });

  await test("UserDogs put Test", async () => {
    await Promise.all(
      testUserDogs.map(async (testUserDog) => {
        const response = await fetch(
          `${url}/userdog/${testUserDog.dog.item.id}/${testUserDog.user.item.uid}`,
          {
            method: "PUT",
            headers: headers(testUserDog.hostUser.token),
            body: JSON.stringify(testUserDog.updateItem),
          }
        );
        strict.deepStrictEqual(response.status, 200);
      })
    );
  });

  await test("get Dogs from Uid Test", async () => {
    await Promise.all(
      testUsers.map(async (user) => {
        const response = await fetch(`${url}/userdog/dogs`, {
          method: "GET",
          headers: headers(user.token),
        });
        const resBody: UserDogsGETDogsResponseBody = await response.json();
        const dogs = resBody.data.dogs;
        strict.deepStrictEqual(user.acceptedDogIds.sort(), dogs.sort());
      })
    );
  });

  await test("get Users from DogId Test", async () => {
    await Promise.all(
      testDogs.map(async (dog) => {
        const response = await fetch(`${url}/userdog/users/${dog.item.id}`, {
          method: "GET",
          headers: headers(dog.hostUser.token),
        });
        const resBody: UserDogsGETUsersResponseBody = await response.json();
        const uids = resBody.data.users;
        strict.deepStrictEqual(dog.memberUids.sort(), uids.sort());
      })
    );
  });
});
await Promise.all(
  testUsers.map((testUser) => {
    testUser.user.user.delete();
  })
);
