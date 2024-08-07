import {
  DeleteItemCommand,
  GetItemCommand,
  UpdateItemCommand,
  AttributeValue,
} from "@aws-sdk/client-dynamodb";

export class Model {
  tableName: string;
  constructor(tableName: string) {
    this.tableName = tableName;
  }

  getItemCommand(id: string) {
    return new GetItemCommand({
      TableName: this.tableName,
      Key: {
        id: { S: id },
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
      if (value.hasOwnProperty("BOOL")) {
        formatedItem[key] = value.BOOL;
      } else if (value.hasOwnProperty("N")) {
        formatedItem[key] = parseInt(value.N);
      } else if (value.hasOwnProperty("S")) {
        formatedItem[key] = value.S;
      }
    }

    return formatedItem;
  }

  createAttributeValue(value: number | boolean | string): AttributeValue {
    if (typeof value === "boolean") {
      return { BOOL: value };
    } else if (typeof value === "number") {
      return { N: value.toString() };
    } else if (typeof value === "string") {
      return { S: value };
    }
  }
}
