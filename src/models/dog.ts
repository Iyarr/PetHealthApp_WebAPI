import {
  GetItemCommand,
  QueryCommand,
  UpdateItemCommand,
  DeleteItemCommand,
  AttributeValue,
} from "@aws-sdk/client-dynamodb";
import { Model } from "./model.js";
import { DBClient } from "../utils/dynamodb.js";
import { DogUpdateItem } from "../types/dog.js";

class DogModel extends Model {
  constructor() {
    super("Dogs");
  }

  async updateItemCommand(id: string, item: DogUpdateItem, uid: string) {
    const updateItems: string[] = [];
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, AttributeValue> = {};
    for (const [key, value] of Object.entries(item)) {
      updateItems.push(`#${key} = :${key}`);
      expressionAttributeNames[`#${key}`] = key;
      expressionAttributeValues[`:${key}`] = this.createAttributeValue(value);
    }
    expressionAttributeNames["#hostId"] = "hostId";
    expressionAttributeValues[":hostId"] = this.createAttributeValue(uid);
    const command = new UpdateItemCommand({
      TableName: this.tableName,
      Key: this.formatItemForCommand({ id }),
      ConditionExpression: "#hostId = :hostId",
      UpdateExpression: `set ${updateItems.join(", ")}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: "ALL_NEW",
    });

    const result = await DBClient.send(command);
    if (result.$metadata.httpStatusCode !== 200) {
      console.log(id, item, result);
      throw new Error("Failed to update item");
    }
    return this.formatItemFromCommand(result.Attributes);
  }

  async batchGetMyDogs(id: string) {
    const command = new QueryCommand({
      TableName: this.tableName,
      IndexName: "hostIdIndex",
      KeyConditions: {
        hostId: {
          ComparisonOperator: "EQ",
          AttributeValueList: [{ S: id }],
        },
      },
    });
    return await DBClient.send(command);
  }

  async deleteItemCommand(id: string, uid: string) {
    const command = new DeleteItemCommand({
      TableName: this.tableName,
      Key: this.formatItemForCommand({ id }),
      ReturnValues: "ALL_OLD",
      ConditionExpression: "#hostId = :hostId",
      ExpressionAttributeNames: {
        "#hostId": "hostId",
      },
      ExpressionAttributeValues: {
        ":hostId": this.createAttributeValue(uid),
      },
    });

    const result = await DBClient.send(command);
    if (result.$metadata.httpStatusCode !== 200) {
      console.log(id, result);
      throw new Error("Failed to delete item");
    }
    return this.formatItemFromCommand(result.Attributes);
  }
}

export const dogModel = new DogModel();
