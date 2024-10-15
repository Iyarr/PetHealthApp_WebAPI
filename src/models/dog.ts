import { QueryCommand } from "@aws-sdk/client-dynamodb";
import { Model } from "./model.js";
import { DBClient } from "../utils/dynamodb.js";

class DogModel extends Model {
  constructor() {
    super("Dogs");
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
}

export const dogModel = new DogModel();
