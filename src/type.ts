export type UserPostItem = {
  uid: string;
  id: string;
  name: string;
  email: string;
};

export type UserPutItem = {
  id?: string;
  name?: string;
  email?: string;
};

export type DogPostItem = {
  id: string;
  name: string;
  gender: string;
  size: string;
  hostId: string;
};

export type DogPutItem = {
  name?: string;
  gender?: string;
  size?: string;
};

export type AllowUserPostItem = {
  userId: string;
  dogId: string;
};
