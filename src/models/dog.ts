import {
  QueryCommand,
  UpdateItemCommand,
  DeleteItemCommand,
  AttributeValue,
  PutItemCommand,
} from "@aws-sdk/client-dynamodb";
import { Model } from "./model.js";
import { DBClient } from "../utils/dynamodb.js";
import { DogsTableAttributes, DogsTableItems, DogModelItemInput } from "../types/dog.js";
import {
  dogsTablePK,
  dogsTableNumberAttributes,
  dogsTableStringAttributes,
} from "../common/dynamodb.js";

class DogModel extends Model {
  constructor() {
    super("Dogs");
  }

  async postItemCommand(item: DogModelItemInput) {
    const commandItem = Object.entries(item).reduce((acc, [key, value]) => {
      if ((dogsTableStringAttributes as readonly string[]).includes(key)) {
        acc[key] = value;
      } else if ((dogsTableNumberAttributes as readonly string[]).includes(key)) {
        acc[key] = Number(value);
      }
      return acc;
    }, {} as DogsTableAttributes);
    const id = await this.addPKIncrement();

    const command = new PutItemCommand({
      TableName: this.tableName,
      Item: this.formatItemForCommand({ ...commandItem, id }),
      ConditionExpression: dogsTablePK.map((key) => `attribute_not_exists(${key})`).join(" AND "),
    });

    try {
      await DBClient.send(command);
    } catch (e) {
      throw new Error(e.message);
    }
    return id;
  }

  async updateItemCommand(id: number, item: Partial<DogModelItemInput>, ownerUid: string) {
    const updateItem = Object.entries(item).reduce((acc, [key, value]) => {
      if ((dogsTableStringAttributes as readonly string[]).includes(key)) {
        acc[key] = value;
      } else if ((dogsTableNumberAttributes as readonly string[]).includes(key)) {
        acc[key] = Number(value);
      }
      return acc;
    }, {} as DogsTableAttributes);
    const updateExpressions: string[] = [];
    const expressionAttributeNames: Record<string, string> = {};
    const expressionAttributeValues: Record<string, AttributeValue> = {};
    for (const [key, value] of Object.entries(updateItem)) {
      updateExpressions.push(`#${key} = :${key}`);
      expressionAttributeNames[`#${key}`] = key;
      expressionAttributeValues[`:${key}`] = this.createAttributeValue(value);
    }
    expressionAttributeNames["#ownerUid"] = "ownerUid";
    expressionAttributeValues[":ownerUid"] = this.createAttributeValue(ownerUid);
    const command = new UpdateItemCommand({
      TableName: this.tableName,
      Key: this.formatItemForCommand({ id }),
      ConditionExpression: "#ownerUid = :ownerUid",
      UpdateExpression: `set ${updateExpressions.join(", ")}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: "ALL_NEW",
    });

    const output = await DBClient.send(command);
    return this.formatItemFromCommand<DogsTableItems>(output.Attributes);
  }

  async batchGetMyDogs(id: number) {
    const command = new QueryCommand({
      TableName: this.tableName,
      IndexName: "ownerUidIndex",
      KeyConditions: {
        ownerUid: {
          ComparisonOperator: "EQ",
          AttributeValueList: [this.createAttributeValue(id)],
        },
      },
    });
    const output = await DBClient.send(command);
    return output.Items.map((item) => this.formatItemFromCommand<DogsTableItems>(item));
  }

  async deleteItemCommand(id: number, uid: string) {
    const command = new DeleteItemCommand({
      TableName: this.tableName,
      Key: this.formatItemForCommand({ id }),
      ReturnValues: "ALL_OLD",
      ConditionExpression: "#ownerUid = :ownerUid",
      ExpressionAttributeNames: {
        "#ownerUid": "ownerUid",
      },
      ExpressionAttributeValues: {
        ":ownerUid": this.createAttributeValue(uid),
      },
    });

    const output = await DBClient.send(command);
    return this.formatItemFromCommand<DogsTableItems>(output.Attributes);
  }
}

export const dogModel = new DogModel();
