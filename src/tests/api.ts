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
  accessibleDogIds: string[];
  item: { uid: string; email: string; password: string };
  token: string;
};

type TestDog = {
  accessibleUsers: string[];
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
const numberOfVariousTestData = 10;
const auth = getAuth(app);
// 一時的なアカウント作成用のランダム文字列を生成
const testUsers: TestUser[] = await Promise.all(
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

const testDogs: TestDog[] = [...Array(numberOfVariousTestData).keys()].map((i: number) => {
  const reqBody: DogPOSTRequestBody = {
    name: i.toString(),
    gender: dogGenders[i % 2],
    size: dog3Sizes[i % 3],
  };
  const hostUidIndex = Math.floor(Math.random() * numberOfVariousTestData);
  const hostUid = testUsers[hostUidIndex].user.user.uid;
  return {
    // アクセスを許可したユーザーのIDを格納
    accessibleUsers: [],
    item: {
      hostUid,
      ...reqBody,
    },
    // UserのtokenやaccessibleDogIdsにアクセスするのに必要
    hostUser: testUsers[hostUidIndex],
    updateItem: {
      gender: dogGenders[(i + 1) % 2],
      size: dog3Sizes[(i + 1) % 3],
    },
  };
});

const testUserDogs: TestUserDog[] = [...Array(numberOfVariousTestData)].map((i: number) => {
  const user = testUsers[Math.floor(Math.random() * numberOfVariousTestData)];
  const uid = user.item.uid;
  while (true) {
    const dogIndex = Math.floor(Math.random() * numberOfVariousTestData);
    const dog = testDogs[dogIndex];
    const hostUser = dog.hostUser;
    if (hostUser.item.uid !== uid && !dog.accessibleUsers.includes(uid)) {
      return {
        user,
        hostUser,
        dog,
        updateItem: {
          isAccepted: i % 2 === 0 ? true : false,
        },
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
  await test("UserDog post to prepare", async () => {
    await Promise.all(
      testUserDogs.map(async (testUserDog) => {
        const item: UserDogPOSTRequestBody = {
          uid: testUserDog.user.item.uid,
          dogId: testUserDog.dog.item.id,
        };
        await fetch(`${url}/userdog`, {
          method: "POST",
          headers: headers(testUserDog.hostUser.token),
          body: JSON.stringify(item),
        });
      })
    );
  });
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
        strict.deepStrictEqual(resBody.data.users, testDog.accessibleUsers);
      })
    );
  });
  await test("Dog delete Test", async () => {
    await Promise.all(
      testDogs.map(async (testDog) => {
        const response = await fetch(`${url}/dog/${testDog.item.id}`, {
          method: "DELETE",
          headers: headers(testDog.hostUser.token),
        });
        const data = await response.json();
        strict.deepStrictEqual(data.message, "Dog deleted");
      })
    );
  });
  await test("UserDog read after Dog delete Test", async () => {
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
          testUserDog.user.accessibleDogIds.push(testUserDog.dog.item.id);
          testUserDog.dog.accessibleUsers.push(testUserDog.user.item.uid);
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
        strict.deepStrictEqual(user.accessibleDogIds.sort(), dogs.sort());
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
        strict.deepStrictEqual(dog.accessibleUsers.sort(), uids.sort());
      })
    );
  });
});
await Promise.all(
  testUsers.map((testUser) => {
    testUser.user.user.delete();
  })
);
