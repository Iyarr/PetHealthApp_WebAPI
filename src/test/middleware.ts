import { test } from "node:test";
import { strict } from "node:assert";
import { getAuth } from "firebase-admin/auth";
import { getValidUidFromToken, FirebaseApp } from "../utils/firebase.js";
import { getEnv } from "../utils/env.js";

type Dog = {
  name: string;
  gender: "male" | "female";
  size: "small" | "medium" | "large";
};

type User = {
  email: string;
  password: string;
  displayName: string;
  dogs: Dog[];
};

type TestData = {
  data: User[];
};

const testJSONData: TestData = {
  data: [
    {
      email: "testUser@example.com",
      displayName: "TestUser",
      password: "testPassword",
      dogs: [
        {
          name: "Bella",
          gender: "male",
          size: "small",
        },
        {
          name: "Charlie",
          gender: "male",
          size: "medium",
        },
        {
          name: "Luna",
          gender: "female",
          size: "small",
        },
        {
          name: "Max",
          gender: "male",
          size: "large",
        },
        {
          name: "Daisy",
          gender: "female",
          size: "small",
        },
        {
          name: "Milo",
          gender: "male",
          size: "medium",
        },
      ],
    },
    {
      email: "testUser2@example.com",
      displayName: "TestUser2",
      password: "testPassword2",
      dogs: [
        {
          name: "Lucy",
          gender: "female",
          size: "medium",
        },
        {
          name: "Cooper",
          gender: "male",
          size: "large",
        },
        {
          name: "Bailey",
          gender: "female",
          size: "small",
        },
        {
          name: "Buddy",
          gender: "male",
          size: "large",
        },
      ],
    },
    {
      email: "testUser3@example.com",
      displayName: "TestUser3",
      password: "testPassword3",
      dogs: [
        {
          name: "Sadie",
          gender: "female",
          size: "medium",
        },
        {
          name: "Rocky",
          gender: "male",
          size: "large",
        },
      ],
    },
    {
      email: "testUser4@example.com",
      displayName: "TestUser4",
      password: "testPassword4",
      dogs: [
        {
          name: "Zoe",
          gender: "female",
          size: "small",
        },
      ],
    },
    {
      email: "testUser5@example.com",
      displayName: "TestUser5",
      password: "testPassword5",
      dogs: [],
    },
  ],
};

const firebaseAuth = getAuth(FirebaseApp);

for (const user of testJSONData.data) {
  const userRecord = await firebaseAuth.createUser(user);
  const token = await firebaseAuth.createCustomToken(userRecord.uid);
  test(`Test user ${userRecord.uid}`, async () => {
    const uid = await getValidUidFromToken(token);
    strict.strictEqual(uid, userRecord.uid);
  });
}
