import { PutItemCommand } from "@aws-sdk/client-dynamodb";
import { Model } from "./model.js";
import { UserPostItem } from "../type.js";

export class UserModel extends Model {
  constructor() {
    super("Users");
  }
  postItemCommand(item: UserPostItem) {
    return new PutItemCommand({
      TableName: this.tableName,
      Item: this.formatItemForCommand(item),
    });
  }
}
