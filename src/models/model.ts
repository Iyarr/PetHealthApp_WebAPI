import {
  DeleteItemCommand,
  GetItemCommand,
  PutItemCommand,
  BatchGetItemCommand,
  BatchWriteItemCommand,
  UpdateItemCommand,
  AttributeValue,
} from "@aws-sdk/client-dynamodb";
import { getEnv } from "../utils/env.js";
import { DBClient } from "../utils/dynamodb.js";

export class Model {
  tableName: string;
  constructor(tableName: string) {
    this.tableName = getEnv("TABLE_PREFIX") + tableName;
  }

  async postItemCommand<T extends object>(item: T) {
    const command = new PutItemCommand({
      TableName: this.tableName,
      Item: this.formatItemForCommand(item),
    });

    const result = await DBClient.send(command);
    if (result.$metadata.httpStatusCode !== 200) {
      console.log(result);
      throw new Error("Failed to post item");
    }
    return result;
  }

  // 項目を追加 or 削除できるのは25個まで
  async batchWriteItemCommand<T extends object>(items: T[]) {
    const requestItems: Record<string, object[]> = {};
    requestItems[this.tableName] = [];
    for (const item of items) {
      requestItems[this.tableName].push({
        PutRequest: {
          Item: this.formatItemForCommand(item),
        },
      });
    }
    const command = new BatchWriteItemCommand({
      RequestItems: requestItems,
    });

    const result = await DBClient.send(command);
    if (result.$metadata.httpStatusCode !== 200) {
      console.log(result);
      throw new Error("Failed to post item");
    }
    return result;
  }

  async getItemCommand<T extends object>(pk: T) {
    const command = new GetItemCommand({
      TableName: this.tableName,
      Key: this.formatItemForCommand(pk),
    });

    const result = await DBClient.send(command);
    if (result.$metadata.httpStatusCode !== 200) {
      console.log(result);
      throw new Error("Failed to get response");
    }
    return result.Item;
  }

  // 項目を取得できるのは100個まで
  async batchGetItemCommand<T extends object>(pks: T[]) {
    const keys: Record<string, AttributeValue>[] = [];
    for (const pk of pks) {
      keys.push(this.formatItemForCommand(pk));
    }
    const command = new BatchGetItemCommand({
      RequestItems: {
        [this.tableName]: {
          Keys: keys,
        },
      },
    });

    const result = await DBClient.send(command);
    if (result.$metadata.httpStatusCode !== 200) {
      console.log(result);
      throw new Error("Failed to get response");
    }
    return result.Responses[this.tableName].map((item) => this.formatItemFromCommand(item));
  }

  async updateItemCommand(pk: object, item: object) {
    const updateItems: string[] = [];
    const expressionAttributeNames: Record<string, string> = {};
    var expressionAttributeValues: Record<string, AttributeValue> = {};
    for (const [key, value] of Object.entries(item)) {
      updateItems.push(`#${key} = :${key}`);
      expressionAttributeNames[`#${key}`] = key;
      expressionAttributeValues[`:${key}`] = this.createAttributeValue(value);
    }
    const command = new UpdateItemCommand({
      TableName: this.tableName,
      Key: this.formatItemForCommand(pk),
      UpdateExpression: `set ${updateItems.join(", ")}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
    });

    const result = await DBClient.send(command);
    if (result.$metadata.httpStatusCode !== 200) {
      console.log(result);
      throw new Error("Failed to get response");
    }
    return this.formatItemFromCommand(result.Attributes);
  }

  async deleteItemCommand<T extends object>(pk: T) {
    const command = new DeleteItemCommand({
      TableName: this.tableName,
      Key: this.formatItemForCommand(pk),
    });

    const result = await DBClient.send(command);
    if (result.$metadata.httpStatusCode !== 200) {
      console.log(result);
      throw new Error("Failed to post item");
    }
    return result;
  }

  // オブジェクトをDynamoDBのCommandでの形式に変換
  formatItemForCommand<T extends object>(item: T): Record<string, AttributeValue> {
    const formatedItem: Record<string, AttributeValue> = {};
    for (const [key, value] of Object.entries(item)) {
      formatedItem[key] = this.createAttributeValue(value);
    }
    return formatedItem;
  }

  // DynamoDBのCommandでの形式をオブジェクトに変換
  formatItemFromCommand(item: Record<string, AttributeValue>) {
    const formatedItem: object = {};
    for (const [key, value] of Object.entries(item)) {
      ["BOOL", "N", "S"].forEach((type) => {
        if (value.hasOwnProperty(type) && value[type]) {
          formatedItem[key] = value[type];
        }
      });
    }
    return formatedItem;
  }

  // AttributeValueを生成
  createAttributeValue(value: number | boolean | string): AttributeValue {
    const attributeValue = {} as AttributeValue;
    if (typeof value === "boolean") {
      attributeValue.BOOL = value;
    } else if (typeof value === "number") {
      attributeValue.N = value.toString();
    } else if (typeof value === "string") {
      attributeValue.S = value;
    } else {
      throw new Error("Could not create AttributeValue");
    }
    return attributeValue;
  }
}
