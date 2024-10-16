import { getAuth } from "firebase-admin/auth";
import { FirebaseApp } from "../utils/firebase.js";

export const getValidUidFromToken = async (token: string) => {
  const auth = getAuth(FirebaseApp);
  try {
    const decodedIdToken = await auth.verifyIdToken(token);
    if (decodedIdToken.aud === FirebaseApp.options.projectId) {
      return "";
    }
    return decodedIdToken.uid;
  } catch (error) {
    return "";
  }
};
