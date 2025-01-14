import { Model } from "./model.js";
import { DBClient } from "../utils/dynamodb.js";

class DiaryItemOptionModel extends Model {
  constructor() {
    super("DiaryItemOptions");
  }
}

export const optionModel = new DiaryItemOptionModel();
