import { Model } from "./model.js";
import { DBClient } from "../utils/dynamodb.js";

class ItemModel extends Model {
  constructor() {
    super("Items");
  }
}

export const diaryModel = new ItemModel();
