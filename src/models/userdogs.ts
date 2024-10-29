import { QueryCommand } from "@aws-sdk/client-dynamodb";
import { Model } from "./model.js";
import { DBClient } from "../utils/dynamodb.js";

class UserDogs extends Model {
  constructor() {
    super("UserDogs");
  }

  async batchGetDogsFromId(id: string) {
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
    return await DBClient.send(command);
  }
}

export const allowUserModel = new UserDogs();
