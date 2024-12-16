import { Model } from "./model.js";

class DiaryItemDetailModel extends Model {
  constructor() {
    super("DiaryItemDetails");
  }
}

export const diaryDetailModel = new DiaryItemDetailModel();
