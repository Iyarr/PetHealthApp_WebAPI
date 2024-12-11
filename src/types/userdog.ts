import {
  userDogsTableNumberPK,
  userDogsTableStringPK,
  userDogsTablePK,
  userDogsTableBooleanAttributes,
  userdogsTableStringAttributes,
} from "../common/dynamodb.js";
import { ResponseBody, ResponseOnlyMessage } from "./utils.js";

// POST
export type UserDogPOSTRequestBody = {
  [K in (typeof userDogsTableStringPK)[number]]: string;
} & {
  [K in (typeof userDogsTableNumberPK)[number]]: number;
};

export type UserDogPOSTResponseBody = ResponseOnlyMessage;

// GET
export type UserDogsGETUsersRequestParams = {
  dogId: number;
};

export type UserDogsGETUsersResponseBody = ResponseBody<{
  users: string[];
}>;

export type UserDogsGETDogsResponseBody = ResponseBody<{
  dogs: number[];
}>;

// PUT
export type UserDogPUTRequestParams = {
  [K in (typeof userDogsTablePK)[number]]: string;
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
type userDogsTableNumberPK = (typeof userDogsTableNumberPK)[number];
type userDogsTableStringPK = (typeof userDogsTableStringPK)[number];
export type UserDogsTablePK = {
  [K in (typeof userDogsTableStringPK)[number]]: string;
} & {
  [K in (typeof userDogsTableNumberPK)[number]]: number;
};

export type UserDogsTableAttributes = {
  [K in (typeof userDogsTableBooleanAttributes)[number]]: boolean;
} & {
  [K in (typeof userdogsTableStringAttributes)[number]]: string;
};
export type UserDogsTableItems = UserDogsTablePK & UserDogsTableAttributes;
