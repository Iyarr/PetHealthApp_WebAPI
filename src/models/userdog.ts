import {
  QueryCommand,
  DeleteItemCommand,
  PutItemCommand,
  BatchWriteItemCommand,
} from "@aws-sdk/client-dynamodb";
import { Model } from "./model.js";
import { DBClient } from "../utils/dynamodb.js";
import { UserDogsTablePK, UserDogsTableItems } from "../types/userdog.js";
import { DynamoDBBatchWriteLimit, userDogsTablePK } from "../common/dynamodb.js";

class UserDogs extends Model {
  constructor() {
    super("UserDogs");
  }

  async postItemCommand<T extends object>(item: T) {
    // 重複チェックのための条件式を作成
    const expressionAttributeNames = {
      "#dogId": "dogId",
      "#uid": "uid",
    };
    const conditionExpression = userDogsTablePK
      .map((key) => {
        return `(attribute_not_exists(#${key}))`;
      })
      .join(" OR ");

    const command = new PutItemCommand({
      TableName: this.tableName,
      Item: this.formatItemForCommand(item),
      ExpressionAttributeNames: expressionAttributeNames,
      ConditionExpression: conditionExpression,
      ReturnValues: "ALL_OLD",
    });

    try {
      const result = await DBClient.send(command);
      if (result.Attributes !== undefined) {
        throw new Error("Existing item updated mistakenly");
      }
    } catch (e) {
      throw new Error(e);
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

  async getNotification(ownerUid: string) {
    const command = new QueryCommand({
      TableName: this.tableName,
      IndexName: "uidIndex",
      KeyConditions: {
        uid: {
          ComparisonOperator: "EQ",
          AttributeValueList: [this.createAttributeValue(ownerUid)],
        },
      },
      ExpressionAttributeNames: {
        "#isAnswered": "isAnswered",
      },
      ExpressionAttributeValues: {
        ":isAnswered": { BOOL: false },
      },
      FilterExpression: "#isAnswered = :isAnswered",
    });
    const result = await DBClient.send(command);
    const items = result.Items.map((item) => this.formatItemFromCommand(item)) as (UserDogsTablePK &
      UserDogsTableItems)[];
    return items;
  }

  async getUserDogsPKToDeleteDog(dogId: string) {
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

  async deleteWithOwnerValidation(pk: UserDogsTablePK, ownerUid: string) {
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

    await DBClient.send(command);
  }

  async deleteItemsWithoutOwnerValidation(Items: UserDogsTablePK[]) {
    const devidedItems = this.sliceObjectList<UserDogsTablePK>(Items, DynamoDBBatchWriteLimit);
    await Promise.all(
      devidedItems.map(async (items) => {
        const command = new BatchWriteItemCommand({
          RequestItems: {
            [this.tableName]: items.map((item) => ({
              DeleteRequest: {
                Key: this.formatItemForCommand(item),
              },
            })),
          },
        });
        await DBClient.send(command);
      })
    );
  }
}

export const userDogModel = new UserDogs();
