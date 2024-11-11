export type UserDogPOSTRequestBody = {
  uid: string;
  dogId: string;
};

export type UserDogPUTRequestBody = {
  isAccepted?: boolean;
};

export type UserDogsDELETERequestParams = {
  uid: string;
  id: string;
};

export type UserDogsGETUsersRequestParams = {
  id: string;
};
