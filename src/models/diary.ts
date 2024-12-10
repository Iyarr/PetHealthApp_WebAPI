import { PutItemCommand, QueryCommand } from "@aws-sdk/client-dynamodb";
import { Model } from "./model.js";
import { DBClient } from "../utils/dynamodb.js";
import { diariesTablePK } from "../common/dynamodb.js";

class DiaryModel extends Model {
  constructor() {
    super("Diaries");
  }

  async postItemCommand<T extends object>(item: T) {
    const command = new PutItemCommand({
      TableName: this.tableName,
      Item: this.formatItemForCommand(item),
      ConditionExpression: diariesTablePK
        .map((key) => {
          return `(attribute_not_exists(#${key}))`;
        })
        .join(" OR "),
      ExpressionAttributeNames: diariesTablePK.reduce((acc, key) => {
        acc[`#${key}`] = key;
        return acc;
      }, {}),
      ReturnValues: "ALL_OLD",
    });

    try {
      const output = await DBClient.send(command);
      return this.formatItemFromCommand(output.Attributes);
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async getDiariesFromDogIdAndMonth(uid: string) {
    const command = new QueryCommand({
      TableName: this.tableName,
    });
  }

  async putItemCommand<T extends object>(item: T) {
    const command = new PutItemCommand({
      TableName: this.tableName,
      Item: this.formatItemForCommand(item),
      ConditionExpression: diariesTablePK
        .map((key) => {
          return `(attribute_exists(#${key}))`;
        })
        .join(" AND "),
      ReturnValues: "ALL_OLD",
    });

    try {
      const output = await DBClient.send(command);
      return this.formatItemFromCommand(output.Attributes);
    } catch (e) {
      throw new Error(e.message);
    }
  }

  async deleteItemCommand<T extends object>(item: T) {
    const command = new PutItemCommand({
      TableName: this.tableName,
      Item: this.formatItemForCommand(item),
      ConditionExpression: diariesTablePK
        .map((key) => {
          return `(attribute_exists(#${key}))`;
        })
        .join(" AND "),
      ReturnValues: "ALL_OLD",
    });

    try {
      const output = await DBClient.send(command);
      return this.formatItemFromCommand(output.Attributes);
    } catch (e) {
      throw new Error(e.message);
    }
  }
}

export const diaryModel = new DiaryModel();
