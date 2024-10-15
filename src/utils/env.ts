import { config } from "dotenv";

export const getEnv = (env: string) => {
  config();
  if (!process.env[env]) {
    throw new Error("Enviroment varible" + env + " is not defined");
  }
  return process.env[env];
};
