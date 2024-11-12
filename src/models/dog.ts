import {
  QueryCommand,
  UpdateItemCommand,
  DeleteItemCommand,
  AttributeValue,
} from "@aws-sdk/client-dynamodb";
import { Model } from "./model.js";
import { DBClient } from "../utils/dynamodb.js";
import { DogPUTRequestBody } from "../types/dog.js";

class DogModel extends Model {
  constructor() {
    super("Dogs");
  }

  async updateItemCommand(id: string, item: DogPUTRequestBody, uid: string) {
    const updateItems: string[] = [];
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, AttributeValue> = {};
    for (const [key, value] of Object.entries(item)) {
      updateItems.push(`#${key} = :${key}`);
      expressionAttributeNames[`#${key}`] = key;
      expressionAttributeValues[`:${key}`] = this.createAttributeValue(value);
    }
    expressionAttributeNames["#hostUid"] = "hostUid";
    expressionAttributeValues[":hostUid"] = this.createAttributeValue(uid);
    const command = new UpdateItemCommand({
      TableName: this.tableName,
      Key: this.formatItemForCommand({ id }),
      ConditionExpression: "#hostUid = :hostUid",
      UpdateExpression: `set ${updateItems.join(", ")}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: "ALL_NEW",
    });

    const output = await DBClient.send(command);
    return this.formatItemFromCommand(output.Attributes);
  }

  async batchGetMyDogs(id: string) {
    const command = new QueryCommand({
      TableName: this.tableName,
      IndexName: "hostUidIndex",
      KeyConditions: {
        hostUid: {
          ComparisonOperator: "EQ",
          AttributeValueList: [{ S: id }],
        },
      },
    });
    const output = await DBClient.send(command);
    return output.Items.map((item) => this.formatItemFromCommand(item));
  }

  async deleteItemCommand(id: string, uid: string) {
    const command = new DeleteItemCommand({
      TableName: this.tableName,
      Key: this.formatItemForCommand({ id }),
      ReturnValues: "ALL_OLD",
      ConditionExpression: "#hostUid = :hostUid",
      ExpressionAttributeNames: {
        "#hostUid": "hostUid",
      },
      ExpressionAttributeValues: {
        ":hostUid": this.createAttributeValue(uid),
      },
    });

    const output = await DBClient.send(command);
    return this.formatItemFromCommand(output.Attributes);
  }
}

export const dogModel = new DogModel();
