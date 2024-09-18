import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getEnv } from "./env.js";

export const FirebaseApp = initializeApp({
  credential: cert({
    projectId: getEnv("FIREBASE_PROJECT_ID"),
    clientEmail: getEnv("FIREBASE_CLIENT_EMAIL"),
    privateKey: getEnv("FIREBASE_PRIVATE_KEY").replaceAll("\\n", "\n"),
  }),
});

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
