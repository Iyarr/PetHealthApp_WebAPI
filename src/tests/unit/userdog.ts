import { test } from "node:test";
import { strict } from "node:assert";
import { userDogModel } from "../../models/userdog.js";
import { dogModel } from "../../models/dog.js";
import { UserDogPOSTRequestBody } from "../../types/userdog.js";
import { DogPOSTRequestBody } from "../../types/dog.js";

const sizes = {
  0: "small",
  1: "medium",
  2: "big",
};
const testDogItems: DogPOSTRequestBody[] = Array(10).map((i: number) => {
  return {
    id: `testId${i}`,
    name: `testName${i}`,
    gender: i % 2 ? "male" : "female",
    size: sizes[i % 3],
  };
});
const testUids = Array(3).map((i: number) => `testUid${i}`);
// ユーザーごとにどの犬のアクセス権限を持たせるかを決める
// 0: 小さい犬のアクセス権限を持つ
// 1: 中くらいの犬のアクセス権限を持つ
// 2: 大きい犬のアクセス権限を持つ

const testUserDogItems: UserDogPOSTRequestBody[] = testDogItems.map((testDogItem) => {
  if (testDogItem.size === "small") {
    return {
      dogId: testDogItem.id,
      uid: testUids[0],
    };
  } else if (testDogItem.size === "medium") {
    return {
      dogId: testDogItem.id,
      uid: testUids[1],
    };
  } else {
    return {
      dogId: testDogItem.id,
      uid: testUids[2],
    };
  }
});

await test("UserDog Test", async (t) => {
  await test("Create Test Dogs", async () => {
    Promise.all(
      testDogItems.map(async (testDogItem) => {
        for (const hostUid of testUids) {
          await dogModel.postItemCommand({ ...testDogItem, ...{ hostUid } });
        }
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
});
