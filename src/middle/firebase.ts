import { getAuth } from "firebase-admin/auth";
import { FirebaseApp } from "../utils/firebase.js";

export const getValidUidFromToken = async (token: string) => {
  const auth = getAuth(FirebaseApp);
  try {
    const decodedIdToken = await auth.verifyIdToken(token);
    return decodedIdToken.uid;
  } catch (error) {
    console.log(`Token: ${token}`);
    console.error(error);
    return "";
  }
};
