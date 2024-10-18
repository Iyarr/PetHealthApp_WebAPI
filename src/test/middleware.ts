import { test } from "node:test";
import { strict } from "node:assert";
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { getValidUidFromToken } from "../middle/firebase.js";
import { env } from "../utils/env.js";

const app = initializeApp({
  apiKey: env.FIREBASE_API_KEY,
  projectId: env.FIREBASE_PROJECT_ID,
});

// 一時的なアカウント作成用のランダム文字列を生成
const random = Math.random().toString();

const user = {
  email: `${random}@example.com`,
  password: random,
};

const auth = getAuth(app);
const loginUser = await createUserWithEmailAndPassword(auth, user.email, user.password);
const token = await loginUser.user.getIdToken();

test("Token Validation Function Test", async () => {
  const uid = await getValidUidFromToken(token);
  strict.strictEqual(uid, loginUser.user.uid);
  loginUser.user.delete();
});
