import {
  GetItemCommand,
  PutItemCommand,
  BatchGetItemCommand,
  BatchWriteItemCommand,
  AttributeValue,
} from "@aws-sdk/client-dynamodb";
import { env } from "../utils/env.js";
import { DBClient } from "../utils/dynamodb.js";
import { DynamoDBBatchWriteLimit } from "../common/dynamodb.js";

export class Model {
  tableName: string;
  constructor(tableName: string) {
    this.tableName = env.TABLE_PREFIX + tableName;
  }

  async getItemCommand<T extends object>(pk: T) {
    const command = new GetItemCommand({
      TableName: this.tableName,
      Key: this.formatItemForCommand(pk),
    });

    try {
      const result = await DBClient.send(command);
      return this.formatItemFromCommand(result.Item);
    } catch (error) {
      throw new Error(error);
    }
  }

  async batchGetItemCommand<T extends object>(pks: T[]) {
    const slicedPks = this.sliceObjectList(pks, DynamoDBBatchWriteLimit);
    const items = await Promise.all(
      slicedPks.map(async (pks) => {
        const command = new BatchGetItemCommand({
          RequestItems: {
            [this.tableName]: {
              Keys: pks.map((pk) => this.formatItemForCommand(pk)),
            },
          },
        });

        const output = await DBClient.send(command);
        return output.Responses[this.tableName].map((item) => this.formatItemFromCommand(item));
      })
    );

    return items.flat();
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

  sliceObjectList<T extends object>(items: T[], limit: number): T[][] {
    const slicedItems: T[][] = [];
    for (let i = 0; i < items.length; i += limit) {
      slicedItems.push(items.slice(i, i + limit));
    }
    slicedItems.push(items.slice(-1 * (items.length % limit)));
    return slicedItems;
  }
}
