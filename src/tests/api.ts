import { test } from "node:test";
import { strict } from "node:assert";
import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth";
import { DogPUTRequestBody, DogPOSTRequestBody } from "../types/dog.js";
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

const dogPOSTRequestItem: DogPOSTRequestBody = {
  name: "testName",
  gender: "male",
  size: "small",
};

const testDogItem = {
  ...dogPOSTRequestItem,
  hostUid: loginUser.user.uid,
  id: "",
};

const dogPUTRequestBody: DogPUTRequestBody = {
  size: "medium",
  gender: "female",
};

const url = `http://localhost:${env.PORT}/dog`;

const headers = {
  "Content-Type": "application/json",
  Authorization: `Bearer ${token}`,
};

async function postMethod() {
  const response = await fetch(url, {
    method: "POST",
    headers: headers,
    body: JSON.stringify(dogPOSTRequestItem),
  });
  const responseJson = await response.json();
  testDogItem.id = responseJson.data.id;
  strict.deepStrictEqual(201, response.status);
}

async function getMethod() {
  const response = await fetch(`${url}/${testDogItem.id}`, {
    method: "GET",
    headers: headers,
  });
  const resBody = await response.json();
  strict.deepStrictEqual(resBody.data.dog, testDogItem);
}

async function putMethod() {
  const response = await fetch(`${url}/${testDogItem.id}`, {
    method: "PUT",
    headers: headers,
    body: JSON.stringify(dogPUTRequestBody),
  });
  const data = await response.json();
  strict.deepStrictEqual(data.message, "Dog updated");
}

async function deleteMethod() {
  const response = await fetch(`${url}/${testDogItem.id}`, {
    method: "DELETE",
    headers: headers,
  });
  const data = await response.json();
  strict.deepStrictEqual(data.message, "Dog deleted");
}

await test("Dog API Test", async () => {
  await test("Dog post Test", async () => {
    await postMethod();
  });
  await test("Dog get Test", async () => {
    await getMethod();
  });
  await test("Dog put Test", async () => {
    await putMethod();
  });
  await test("Dog delete Test", async () => {
    await deleteMethod();
  });
});

loginUser.user.delete();
