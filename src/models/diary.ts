import { PutItemCommand, QueryCommand } from "@aws-sdk/client-dynamodb";
import { Model } from "./model.js";
import { DBClient } from "../utils/dynamodb.js";
import { diariesTablePK } from "../common/dynamodb.js";
import { DiariesTableItems } from "../types/diary.js";

class DiaryModel extends Model {
  constructor() {
    super("Diaries");
  }

  async postItemCommand<T extends object>(item: T) {
    const whetherComplexPKIsNotExist = diariesTablePK
      .map((key) => `(attribute_not_exists(#${key}))`)
      .join(" OR ");
    const command = new PutItemCommand({
      TableName: this.tableName,
      Item: this.formatItemForCommand(item),
      ExpressionAttributeNames: diariesTablePK.reduce(
        (acc, key) => ({ ...acc, [`#${key}`]: key }),
        {}
      ),
      ConditionExpression: whetherComplexPKIsNotExist,
    });

    try {
      await DBClient.send(command);
    } catch (e) {
      throw new Error(e);
    }
  }

  async getDiariesFromDogIdAndMonth(dogId: number, year: number, month: number) {
    const startDate = new Date(year, month - 1);
    const endDate = new Date(year, month);
    endDate.setDate(0);
    const command = new QueryCommand({
      TableName: this.tableName,
      KeyConditionExpression: "#dogId = :dogId AND #date BETWEEN :startDate AND :endDate",
      ExpressionAttributeNames: {
        "#dogId": "dogId",
        "#date": "date",
      },
      ExpressionAttributeValues: {
        ":dogId": { N: dogId.toString() },
        ":startDate": { S: startDate.toISOString() },
        ":endDate": { S: endDate.toISOString() },
      },
    });

    try {
      const output = await DBClient.send(command);
      const items = output.Items.map((item) =>
        this.formatItemFromCommand(item)
      ) as DiariesTableItems[];
      return items;
    } catch (e) {
      throw new Error(e.message);
    }
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
