import {
  GetItemCommand,
  UpdateItemCommand,
  PutItemCommand,
  BatchGetItemCommand,
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

  async postItem<T extends object>(item: T) {
    const id = this.addPKIncrement();
    const command = new PutItemCommand({
      TableName: this.tableName,
      Item: this.formatItemForCommand({ ...item, id }),
    });

    try {
      await DBClient.send(command);
      return id;
    } catch (error) {
      throw new Error(error);
    }
  }

  async getItemCommand<Tin extends object, Tout extends object>(pk: Tin) {
    const command = new GetItemCommand({
      TableName: this.tableName,
      Key: this.formatItemForCommand(pk),
    });

    try {
      const result = await DBClient.send(command);
      return this.formatItemFromCommand<Tout>(result.Item);
    } catch (error) {
      throw new Error(error);
    }
  }

  async batchGetItemCommand<Tin extends object, Tout extends object>(pks: Tin[]) {
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
        return output.Responses[this.tableName].map((item) =>
          this.formatItemFromCommand<Tout>(item)
        );
      })
    );

    return items.flat();
  }

  async addPKIncrement(incr: number = 1) {
    const command = new UpdateItemCommand({
      TableName: `${env.TABLE_PREFIX}IDKeys`,
      Key: this.formatItemForCommand({ tableName: this.tableName }),
      UpdateExpression: `SET #length = #length + :incr`,
      ExpressionAttributeNames: {
        "#length": "length",
      },
      ExpressionAttributeValues: {
        ":incr": { N: incr.toString() },
      },
      ReturnValues: "ALL_NEW",
    });

    try {
      const output = await DBClient.send(command);
      const id = this.formatItemFromCommand(output.Attributes) as { length: number };
      return id.length;
    } catch (e) {
      throw new Error(e);
    }
  }

  async getPKIncrement() {
    const command = new GetItemCommand({
      TableName: `${env.TABLE_PREFIX}IDKeys`,
      Key: this.formatItemForCommand({ tableName: this.tableName }),
    });
    const output = await DBClient.send(command);
    const item = this.formatItemFromCommand(output.Item) as { tableName: string; length: number };
    return item.length;
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
  formatItemFromCommand<T extends object>(item: Record<string, AttributeValue>) {
    const formatedItem: object = {};
    for (const [key, value] of Object.entries(item)) {
      formatedItem[key] = this.convertAttributeValueToPrimitive(value);
    }
    return formatedItem as T;
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
      throw new Error(`${typeof value} Values Could not create AttributeValue`);
    }
    return attributeValue;
  }

  // AttributeValueをプリミティブ型に変換
  convertAttributeValueToPrimitive(value: AttributeValue) {
    if (value.hasOwnProperty("BOOL")) {
      return value.BOOL;
    } else if (value.hasOwnProperty("N")) {
      return Number(value.N);
    } else if (value.hasOwnProperty("S")) {
      return value.S;
    } else {
      throw new Error("Could not convert AttributeValue to primitive type");
    }
  }

  sliceObjectList<T extends object>(items: T[], limit: number): T[][] {
    const slicedItems: T[][] = [];
    for (let i = 0; ; i += limit) {
      if (i + limit >= items.length) {
        slicedItems.push(items.slice(i));
        break;
      }
      slicedItems.push(items.slice(i, i + limit));
    }
    return slicedItems;
  }
}
