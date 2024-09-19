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

export class Model {
  tableName: string;
  constructor(tableName: string) {
    this.tableName = getEnv("TABLE_PREFIX") + tableName;
  }

  postItemCommand(item: object) {
    return new PutItemCommand({
      TableName: this.tableName,
      Item: this.formatItemForCommand(item),
    });
  }

  // 項目を追加 or 削除できるのは25個まで
  batchWriteItemCommand(items: object[]) {
    const requestItems: Record<string, object[]> = {};
    requestItems[this.tableName] = [];
    for (const item of items) {
      requestItems[this.tableName].push({
        PutRequest: {
          Item: this.formatItemForCommand(item),
        },
      });
    }
    return new BatchWriteItemCommand({
      RequestItems: requestItems,
    });
  }

  getItemCommand(pk: object) {
    return new GetItemCommand({
      TableName: this.tableName,
      Key: this.formatItemForCommand(pk),
    });
  }

  // 項目を取得できるのは100個まで
  batchGetItemCommand(pks: object[]) {
    const keys: Record<string, AttributeValue>[] = [];
    for (const pk of pks) {
      keys.push(this.formatItemForCommand(pk));
    }
    return new BatchGetItemCommand({
      RequestItems: {
        [this.tableName]: {
          Keys: keys,
        },
      },
    });
  }

  updateItemCommand(pk: object, item: object) {
    const updateItems: string[] = [];
    const expressionAttributeNames: Record<string, string> = {};
    var expressionAttributeValues: Record<string, AttributeValue> = {};
    for (const [key, value] of Object.entries(item)) {
      updateItems.push(`#${key} = :${key}`);
      expressionAttributeNames[`#${key}`] = key;
      expressionAttributeValues[`:${key}`] = this.createAttributeValue(value);
    }
    return new UpdateItemCommand({
      TableName: this.tableName,
      Key: this.formatItemForCommand(pk),
      UpdateExpression: `set ${updateItems.join(", ")}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
    });
  }

  deleteItemCommand(pk: object) {
    return new DeleteItemCommand({
      TableName: this.tableName,
      Key: this.formatItemForCommand(pk),
    });
  }

  // オブジェクトをDynamoDBのCommandでの形式に変換
  formatItemForCommand(item: object): Record<string, AttributeValue> {
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
