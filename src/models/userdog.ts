import { QueryCommand, DeleteItemCommand, PutItemCommand } from "@aws-sdk/client-dynamodb";
import { Model } from "./model.js";
import { DBClient } from "../utils/dynamodb.js";
import { UserDogsDELETERequestParams } from "../types/userdog.js";
import { UserDogsTableItems } from "../types/userdog.js";
import { userDogsTablePK } from "../common/dynamodb.js";

class UserDogs extends Model {
  constructor() {
    super("UserDogs");
  }

  async postItemCommand<T extends object>(item: T) {
    // 重複チェックのための条件式を作成
    const expressionAttributeNames: Record<string, string> = {};
    const conditionExpression = Object.keys(item)
      .map((key) => {
        expressionAttributeNames[`#${key}`] = key;
        return `attribute_not_exists(#${key})`;
      })
      .join(" AND ");

    const command = new PutItemCommand({
      TableName: this.tableName,
      Item: this.formatItemForCommand(item),
      ConditionExpression: conditionExpression,
      ExpressionAttributeNames: expressionAttributeNames,
      ReturnValues: "ALL_OLD",
    });

    try {
      const result = await DBClient.send(command);
      if (result.Attributes !== undefined) {
        throw new Error("Existing item updated mistakenly");
      }
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async getDogsFromUid(uid: string) {
    const command = new QueryCommand({
      TableName: this.tableName,
      IndexName: "uidIndex",
      KeyConditions: {
        uid: {
          ComparisonOperator: "EQ",
          AttributeValueList: [this.createAttributeValue(uid)],
        },
      },
      ExpressionAttributeNames: { "#isAccepted": "isAccepted" },
      ExpressionAttributeValues: { ":isAccepted": { BOOL: true } },
      FilterExpression: "#isAccepted = :isAccepted",
    });
    const result = await DBClient.send(command);
    const items = result.Items.map((item) =>
      this.formatItemFromCommand(item)
    ) as UserDogsTableItems[];
    return items;
  }

  async getUsersFromDogId(dogId: string) {
    const command = new QueryCommand({
      TableName: this.tableName,
      IndexName: "dogIdIndex",
      KeyConditions: {
        dogId: {
          ComparisonOperator: "EQ",
          AttributeValueList: [this.createAttributeValue(dogId)],
        },
      },
      ExpressionAttributeNames: { "#isAccepted": "isAccepted" },
      ExpressionAttributeValues: { ":isAccepted": { BOOL: true } },
      FilterExpression: "#isAccepted = :isAccepted",
    });
    const result = await DBClient.send(command);
    const items = result.Items.map((item) =>
      this.formatItemFromCommand(item)
    ) as UserDogsTableItems[];
    return items;
  }

  async update<T extends object>(item: T) {
    const command = new PutItemCommand({
      TableName: this.tableName,
      Item: this.formatItemForCommand(item),
      ConditionExpression: userDogsTablePK.map((key) => `attribute_exists(#${key})`).join(" AND "),
      ExpressionAttributeNames: {
        "#dogId": "dogId",
        "#uid": "uid",
      },
    });
    const result = await DBClient.send(command);
  }

  async delete(pk: UserDogsDELETERequestParams, ownerUid: string) {
    const command = new DeleteItemCommand({
      TableName: this.tableName,
      Key: this.formatItemForCommand(pk),
      ConditionExpression: "#ownerUid = :ownerUid",
      ExpressionAttributeNames: {
        "#ownerUid": "ownerUid",
      },
      ExpressionAttributeValues: {
        ":ownerUid": this.createAttributeValue(ownerUid),
      },
    });

    const result = await DBClient.send(command);
    return this.formatItemFromCommand(result.Attributes);
  }

  async deleteUserDogsWithDogId(dogId: string) {
    const command = new QueryCommand({
      TableName: this.tableName,
      IndexName: "dogIdIndex",
      KeyConditions: {
        dogId: {
          ComparisonOperator: "EQ",
          AttributeValueList: [this.createAttributeValue(dogId)],
        },
      },
    });
    const output = await DBClient.send(command);
  }
}

export const userDogModel = new UserDogs();
