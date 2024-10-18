import {
  DeleteItemCommand,
  GetItemCommand,
  PutItemCommand,
  BatchGetItemCommand,
  BatchWriteItemCommand,
  UpdateItemCommand,
  AttributeValue,
} from "@aws-sdk/client-dynamodb";
import { env } from "../utils/env.js";
import { DBClient } from "../utils/dynamodb.js";

export class Model {
  tableName: string;
  constructor(tableName: string) {
    this.tableName = env.TABLE_PREFIX + tableName;
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
      if (result.$metadata.httpStatusCode !== 200) {
        console.error(item, result);
        throw new Error("Failed to post item");
      } else if (result.Attributes !== undefined) {
        throw new Error("Existing item updated mistakenly");
      }
    } catch (error) {
      if (error.message === "The conditional request failed") {
        throw new Error("Item already exists");
      }
      throw new Error(error.message);
    }
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
      console.log(items, result);
      throw new Error("Failed to post item");
    }
    return result.UnprocessedItems;
  }

  async getItemCommand<T extends object>(pk: T) {
    const command = new GetItemCommand({
      TableName: this.tableName,
      Key: this.formatItemForCommand(pk),
    });

    const result = await DBClient.send(command);
    if (result.$metadata.httpStatusCode !== 200) {
      console.log(pk, result);
      throw new Error("Failed to get response");
    }
    return this.formatItemFromCommand(result.Item);
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
      console.log(pks, result);
      throw new Error("Failed to get response");
    }
    return result.Responses[this.tableName].map((item) => this.formatItemFromCommand(item));
  }

  async updateItemCommand(pk: object, item: object) {
    const updateItems: string[] = [];
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, AttributeValue> = {};
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
      ReturnValues: "ALL_NEW",
    });

    const result = await DBClient.send(command);
    if (result.$metadata.httpStatusCode !== 200) {
      console.log(pk, item, result);
      throw new Error("Failed to get response");
    }
    return this.formatItemFromCommand(result.Attributes);
  }

  async deleteItemCommand<T extends object>(pk: T) {
    const command = new DeleteItemCommand({
      TableName: this.tableName,
      Key: this.formatItemForCommand(pk),
      ReturnValues: "ALL_OLD",
    });

    const result = await DBClient.send(command);
    if (result.$metadata.httpStatusCode !== 200) {
      console.log(pk, result);
      throw new Error("Failed to post item");
    }
    return this.formatItemFromCommand(result.Attributes);
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
