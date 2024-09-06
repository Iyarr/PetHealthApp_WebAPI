import { initializeApp, cert } from "firebase-admin/app";
import { getEnv } from "./env.js";

export const createFirebaseApp = () => {
  return initializeApp({
    credential: cert({
      projectId: getEnv("FIREBASE_PROJECT_ID"),
      privateKey: getEnv("FIREBASE_CLIENT_EMAIL"),
      clientEmail: getEnv("FIREBASE_PRIVATE_KEY").replaceAll("\\n", "\n"),
    }),
  });
};
