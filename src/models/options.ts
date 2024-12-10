import { Model } from "./model.js";
import { DBClient } from "../utils/dynamodb.js";

class OptionModel extends Model {
  constructor() {
    super("Options");
  }
}

export const optionModel = new OptionModel();
