import { DeleteItemCommand, UpdateItemCommand, AttributeValue } from "@aws-sdk/client-dynamodb";
import { Model } from "./model.js";
import { DBClient } from "../utils/dynamodb.js";

class UserModel extends Model {
  constructor() {
    super("Users");
  }

  async updateItemCommand<pkT extends object, itemT extends object>(pk: pkT, item: itemT) {
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
}

export const userModel = new UserModel();
