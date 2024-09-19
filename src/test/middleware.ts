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

const testJSONData: TestData = JSON.parse(getEnv("FIREBASE_TESTDATA"));

const firebaseAuth = getAuth(FirebaseApp);

for (const user of testJSONData.data) {
  const userRecord = await firebaseAuth.createUser(user);
  const token = await firebaseAuth.createCustomToken(userRecord.uid);
  test(`Test user ${userRecord.uid}`, async () => {
    const uid = await getValidUidFromToken(token);
    strict.strictEqual(uid, userRecord.uid);
  });
}
