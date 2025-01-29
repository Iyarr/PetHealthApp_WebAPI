import { BatchWriteItemCommand } from "@aws-sdk/client-dynamodb";
import { Model } from "./model.js";
import { DBClient } from "../utils/dynamodb.js";
import { DiaryItemsTableAttributes } from "../types/diary.js";
import { DynamoDBBatchWriteLimit } from "../common/dynamodb.js";

class DiaryItemModel extends Model {
  constructor() {
    super("DiaryItems");
  }

  async batchPostItem(items: DiaryItemsTableAttributes[]) {
    const itemPK = await this.addPKIncrement(items.length);
    const slicedItems = this.sliceObjectList(items, DynamoDBBatchWriteLimit);
    const itemIds = await Promise.all(
      slicedItems.map(async (items) => {
        const command = new BatchWriteItemCommand({
          RequestItems: {
            [this.tableName]: items.map((item) => ({
              PutRequest: {
                Item: this.formatItemForCommand(item),
              },
            })),
          },
        });

        try {
          await DBClient.send(command);
          return items.map((item) => item.id);
        } catch (e) {
          throw new Error(e);
        }
      })
    );

    return itemIds.flat();
  }
}

export const diaryItemModel = new DiaryItemModel();
