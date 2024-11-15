// POST
export type UserDogPOSTRequestBody = {
  uid: string;
  dogId: string;
};

export type UserDogPOSTResponseBody = {
  message: string;
};

// GET
export type UserDogsGETUsersRequestParams = {
  dogId: string;
};

export type UserDogsGETDogsRequestParams = {
  uid: string;
};

export type UserDogsGETResponseBody = {
  message: string;
  data: {
    uid: string;
    dogId: string;
    isAccepted: boolean;
  }[];
};

// PUT
export type UserDogPUTRequestParams = {
  uid: string;
  id: string;
};

export type UserDogPUTRequestBody = {
  isAccepted?: boolean;
};

export type UserDogPUTResponseBody = {
  message: string;
};

// DELETE
export type UserDogsDELETERequestParams = {
  uid: string;
  id: string;
};

export type UserDogsDELETEResponseBody = {
  message: string;
};
