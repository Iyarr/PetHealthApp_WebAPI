import { Model } from "./model.js";
import { DBClient } from "../utils/dynamodb.js";

class DiaryItemModel extends Model {
  constructor() {
    super("DiaryItems");
  }
}

export const diaryItemModel = new DiaryItemModel();
