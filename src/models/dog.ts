import { PutItemCommand } from "@aws-sdk/client-dynamodb";
import { Model } from "./model.js";
import { DogPostItem } from "../type.js";

export class DogModel extends Model {
  constructor() {
    super("Dogs");
  }
  postItemCommand(item: DogPostItem) {
    return new PutItemCommand({
      TableName: this.tableName,
      Item: this.formatItemForCommand(item),
    });
  }
}
