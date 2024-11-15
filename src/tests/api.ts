import { test } from "node:test";
import { strict } from "node:assert";
import { initializeApp } from "firebase/app";
import { randomUUID } from "node:crypto";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { dogGenders, dog3Sizes } from "../common/dogs.js";
import { DogPUTRequestBody, DogPOSTRequestBody } from "../types/dog.js";
import {
  UserDogPOSTRequestBody,
  UserDogPOSTResponseBody,
  UserDogsGETResponseBody,
  UserDogPUTRequestBody,
  UserDogPUTResponseBody,
  UserDogsDELETERequestParams,
  UserDogsDELETEResponseBody,
} from "../types/userdog.js";
import { env } from "../utils/env.js";

const app = initializeApp({
  apiKey: env.FIREBASE_API_KEY,
  projectId: env.FIREBASE_PROJECT_ID,
});

const numberOfVariousTestData = 10;
const auth = getAuth(app);
// 一時的なアカウント作成用のランダム文字列を生成
const testUsers = await Promise.all(
  [...Array(numberOfVariousTestData).keys()].map(async () => {
    const random = Math.random().toString();
    const email = `${random}@example.com`;
    const password = randomUUID();
    const user = await createUserWithEmailAndPassword(auth, email, password);
    const token = await user.user.getIdToken();

    return {
      user,
      accessibleDogIds: [],
      item: {
        uid: user.user.uid,
        email,
        password,
      },
      token,
    };
  })
);

const testDogs = [...Array(numberOfVariousTestData).keys()].map((i: number) => {
  const reqBody: DogPOSTRequestBody = {
    name: i.toString(),
    gender: dogGenders[i % 2],
    size: dog3Sizes[i % 3],
  };
  const id = randomUUID();
  const hostUidIndex = Math.floor(Math.random() * numberOfVariousTestData);
  const hostUid = testUsers[hostUidIndex].item.uid;
  return {
    // アクセスを許可したユーザーを格納
    accessibleUsers: [],
    item: {
      id,
      hostUid,
      ...reqBody,
    },
    hostUserToken: testUsers[hostUidIndex].token,
    updateItem: {
      gender: dogGenders[(i + 1) % 2],
      size: dog3Sizes[(i + 1) % 3],
    },
  };
});

const testUserDogItems = [...Array(numberOfVariousTestData)].map(() => {
  const uid = testUsers[Math.floor(Math.random() * numberOfVariousTestData)].item.uid;
  while (true) {
    const index = Math.floor(Math.random() * numberOfVariousTestData);
    if (testDogs[index].item.hostUid !== uid && !testDogs[index].accessibleUsers.includes(uid)) {
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

const headers = (token: string) => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
});

await test("Dog API Test", async () => {
  const url = `http://localhost:${env.PORT}/dog`;
  await test("Dog post Test", async () => {
    await Promise.all(
      testDogs.map(async (testDog) => {
        const response = await fetch(url, {
          method: "POST",
          headers: headers(testDog.hostUserToken),
          body: JSON.stringify(testDog.item),
        });
        const responseJson = await response.json();
        testDog.item.id = responseJson.data.id;
        strict.deepStrictEqual(201, response.status);
      })
    );
  });
  await test("Dog get Test", async () => {
    await Promise.all(
      testDogs.map(async (testDog) => {
        const response = await fetch(`${url}/${testDog.item.id}`, {
          method: "GET",
          headers: headers(testDog.hostUserToken),
        });
        const resBody = await response.json();
        strict.deepStrictEqual(resBody.data.dog, testDog.item);
      })
    );
  });
  await test("Dog put Test", async () => {
    await Promise.all(
      testDogs.map(async (testDog) => {
        const response = await fetch(`${url}/${testDog.item.id}`, {
          method: "PUT",
          headers: headers(testDog.hostUserToken),
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
        const response = await fetch(`${url}/${testDog.item.id}`, {
          method: "GET",
          headers: headers(testDog.hostUserToken),
        });
        const resBody = await response.json();
        strict.deepStrictEqual(resBody.data.dog, { ...testDog.item, ...testDog.updateItem });
      })
    );
  });
  await test("Dog delete Test", async () => {
    await Promise.all(
      testDogs.map(async (testDog) => {
        const response = await fetch(`${url}/${testDog.item.id}`, {
          method: "DELETE",
          headers: headers(testDog.hostUserToken),
        });
        const data = await response.json();
        strict.deepStrictEqual(data.message, "Dog deleted");
      })
    );
  });
});

await test("UserDogs API Test", async () => {
  const url = `http://localhost:${env.PORT}/userdog`;
  await test("Dog post to prepare", async () => {
    await Promise.all(
      testDogs.map(async (testDog) => {
        const response = await fetch("http://localhost:3000/dog", {
          method: "POST",
          headers: headers(testDog.hostUserToken),
          body: JSON.stringify(testDog.item),
        });
        const responseJson = await response.json();
        testDog.item.id = responseJson.data.id;
        strict.deepStrictEqual(201, response.status);
      })
    );
  });
  await test("UserDogs post Test", async () => {
    await Promise.all(
      testUserDogItems.map(async (testUserDogItem) => {
        const response = await fetch(url, {
          method: "POST",
          headers: headers(testUserDogItem.uid),
          body: JSON.stringify(testUserDogItem),
        });
        const responseJson = (await response.json()) as UserDogPOSTResponseBody;
        strict.deepStrictEqual(201, response.status);
      })
    );
  });
  await test("get Dogs from Uid Test", async () => {
    await Promise.all(
      testUsers.map(async (user) => {
        const response = await fetch(`${url}/uid/${user.item.uid}`, {
          method: "GET",
          headers: headers(user.token),
        });
        const resBody = (await response.json()) as UserDogsGETResponseBody;
        const dogIds = resBody.data.map((dog) => dog.dogId);
        strict.deepStrictEqual(dogIds.sort(), user.accessibleDogIds.sort());
      })
    );
  });

  await test("get Users from DogId Test", async () => {
    await Promise.all(
      testDogs.map(async (dog) => {
        const response = await fetch(`${url}/dog/${dog.item.id}`, {
          method: "GET",
          headers: headers(dog.hostUserToken),
        });
        const resBody = (await response.json()) as UserDogsGETResponseBody;
        const uids = resBody.data.map((user) => user.uid);
        strict.deepStrictEqual(uids.sort(), dog.accessibleUsers.sort());
      })
    );
  });
});

await Promise.all(
  testUsers.map((testUser) => {
    testUser.user.user.delete();
  })
);
