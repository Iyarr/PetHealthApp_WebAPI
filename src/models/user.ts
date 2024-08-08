import { PutItemCommand } from "@aws-sdk/client-dynamodb";
import { Model } from "./model.js";
import { UserPostItem } from "../type.js";

export class UserModel extends Model {
  constructor() {
    super(`${process.env.TABLE_PREFIX}Users`);
  }
  postItemCommand(item: UserPostItem) {
    return new PutItemCommand({
      TableName: this.tableName,
      Item: this.formatItemForCommand(item),
    });
  }
}
