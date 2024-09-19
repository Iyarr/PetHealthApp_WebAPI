import { QueryCommand } from "@aws-sdk/client-dynamodb";
import { Model } from "./model.js";

export class DogModel extends Model {
  constructor() {
    super("Dogs");
  }

  batchGetMyDogs(id: string) {
    return new QueryCommand({
      TableName: this.tableName,
      IndexName: "hostIdIndex",
      KeyConditions: {
        hostId: {
          ComparisonOperator: "EQ",
          AttributeValueList: [{ S: id }],
        },
      },
    });
  }
}
