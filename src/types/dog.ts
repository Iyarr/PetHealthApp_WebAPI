export type DogPostItem = {
  id: string;
  name: string;
  gender: string;
  size: string;
  hostUid: string;
};

export type DogUpdateItem = {
  name?: string;
  gender?: string;
  size?: string;
};
