import {
  DeleteItemCommand,
  GetItemCommand,
  BatchGetItemCommand,
  UpdateItemCommand,
  AttributeValue,
} from "@aws-sdk/client-dynamodb";
import { getEnv } from "../utils.js";

export class Model {
  tableName: string;
  constructor(tableName: string) {
    this.tableName = getEnv("TABLE_PREFIX") + tableName;
  }

  getItemCommand(id: string) {
    return new GetItemCommand({
      TableName: this.tableName,
      Key: {
        id: { S: id },
      },
    });
  }

  batchGetItemCommand(ids: string[]) {
    const keys: Record<string, AttributeValue>[] = [];
    for (const id of ids) {
      keys.push({
        id: { S: id },
      });
    }
    return new BatchGetItemCommand({
      RequestItems: {
        [this.tableName]: {
          Keys: keys,
        },
      },
    });
  }

  deleteItemCommand(id: string) {
    return new DeleteItemCommand({
      TableName: this.tableName,
      Key: {
        id: { S: id },
      },
    });
  }

  updateItemCommand(id: string, item: object) {
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
      Key: {
        id: { S: id },
      },
      UpdateExpression: `set ${updateItems.join(", ")}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
    });
  }

  formatItemForCommand(item: object): Record<string, AttributeValue> {
    const formatedItem: Record<string, AttributeValue> = {};
    for (const [key, value] of Object.entries(item)) {
      formatedItem[key] = this.createAttributeValue(value);
    }
    return formatedItem;
  }

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
