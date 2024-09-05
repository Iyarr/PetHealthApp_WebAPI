export const getEnv = (env: string) => {
  if (!process.env[env]) {
    throw new Error(`Enviroment varible ${env} is not defined`);
  }
  return process.env[env];
};
