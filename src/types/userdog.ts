import {
  userDogsTablePK,
  userDogsTableBooleanAttributes,
  userdogsTableStringAttributes,
} from "../common/dynamodb.js";
import { ResponseBody, ResponseOnlyMessage } from "./utils.js";

// POST
type UserDogPOSTReqBodyKeyType = (typeof userDogsTablePK)[number];
export type UserDogPOSTRequestBody = {
  [K in UserDogPOSTReqBodyKeyType]: string;
};

export type UserDogPOSTResponseBody = ResponseOnlyMessage;

// GET
export type UserDogsGETUsersRequestParams = {
  dogId: string;
};

export type UserDogsGETUsersResponseBody = ResponseBody<{
  users: string[];
}>;

export type UserDogsGETDogsResponseBody = ResponseBody<{
  dogs: string[];
}>;

// PUT
type UserDogPUTReqBodyKeyType = (typeof userDogsTablePK)[number];
export type UserDogPUTRequestParams = {
  [K in UserDogPUTReqBodyKeyType]: string;
};

export type UserDogPUTRequestBody = {
  isAccepted: boolean;
};

export type UserDogPUTResponseBody = ResponseOnlyMessage;

// DELETE
type UserDogsDELETEReqBodyKeyType = (typeof userDogsTablePK)[number];

export type UserDogsDELETERequestParams = {
  [K in UserDogsDELETEReqBodyKeyType]: string;
};

export type UserDogsDELETEResponseBody = ResponseOnlyMessage;

// DynamoDB
export type UserDogsTablePK = {
  [K in (typeof userDogsTablePK)[number]]: string;
};

export type UserDogsTableItems = {
  [K in (typeof userDogsTableBooleanAttributes)[number]]: boolean;
} & {
  [K in (typeof userdogsTableStringAttributes)[number]]: string;
} & UserDogsTablePK;
