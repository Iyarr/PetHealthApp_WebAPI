import {
  dogsTablePK,
  dogsTableNumberAttributes,
  dogsTableStringAttributes,
  dogsTableAttributes,
  dogsTableItems,
} from "../common/dynamodb.js";

// Request
export type DogPOSTRequestBody = {
  [K in (typeof dogsTableAttributes)[number]]: string;
};

export type DogPUTRequestBody = {
  [K in (typeof dogsTableAttributes)[number]]?: string;
};

export type DogPUTRequestParams = {
  [K in (typeof dogsTablePK)[number]]: string;
};

// Response

// DynamoDB
export type DogsTableNumberPK = {
  [K in (typeof dogsTablePK)[number]]: number;
};

export type DogsTableStringAttributes = {
  [K in (typeof dogsTableStringAttributes)[number]]: string;
};

export type DogsTableNumberAttributes = {
  [K in (typeof dogsTableNumberAttributes)[number]]: number;
};

export type DogsTableAttributes = DogsTableStringAttributes & DogsTableNumberAttributes;
export type DogsTablePK = {
  [K in (typeof dogsTablePK)[number]]: number;
};

export type DogsTableItems = DogsTablePK & DogsTableAttributes;

// Others
export type DogModelItemInput = {
  [K in (typeof dogsTableAttributes)[number]]: string;
};
