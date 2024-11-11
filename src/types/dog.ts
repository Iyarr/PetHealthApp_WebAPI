export type DogPOSTRequestBody = {
  name: string;
  gender: string;
  size: string;
};

export type DogPUTRequestBody = {
  name?: string;
  gender?: string;
  size?: string;
};
