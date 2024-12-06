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
import { userDogsTableBooleanAttributes } from "../common/dynamodb.js";

class UserDogs extends Model {
  constructor() {
    super("UserDogs");
  }

  async postItemCommand<T extends object>(item: T) {
    const whetherComplexPKIsNotExist = userDogsTablePK
      .map((key) => `(attribute_not_exists(#${key}))`)
      .join(" OR ");
    const isNotAccepted = `#isAccepted = :false AND #isAnswered = :true`;
    const command = new PutItemCommand({
      TableName: this.tableName,
      Item: this.formatItemForCommand(item),
      ReturnValues: "ALL_OLD",
      ConditionExpression: `(${whetherComplexPKIsNotExist}) OR (${isNotAccepted})`,
      ExpressionAttributeNames: {
        ...userDogsTableBooleanAttributes.reduce((acc, key) => ({ ...acc, [`#${key}`]: key }), {}),
        ...userDogsTablePK.reduce((acc, key) => ({ ...acc, [`#${key}`]: key }), {}),
      },
      ExpressionAttributeValues: {
        ":false": this.createAttributeValue(false),
        ":true": this.createAttributeValue(true),
      },
    });

    try {
      await DBClient.send(command);
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
    const output = await DBClient.send(command);
    const items = output.Items.map((item) =>
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
        ...userDogsTablePK.reduce((acc, key) => ({ ...acc, [`#${key}`]: key }), {}),
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
