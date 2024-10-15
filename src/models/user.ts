import { Model } from "./model.js";

class UserModel extends Model {
  constructor() {
    super("Users");
  }
}

export const userModel = new UserModel();
