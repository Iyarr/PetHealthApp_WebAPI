import { initializeApp, cert } from "firebase-admin/app";
import { getEnv } from "./env.js";

export const FirebaseApp = initializeApp({
  credential: cert({
    projectId: getEnv("FIREBASE_PROJECT_ID"),
    clientEmail: getEnv("FIREBASE_CLIENT_EMAIL"),
    privateKey: getEnv("FIREBASE_PRIVATE_KEY").replaceAll("\\n", "\n"),
  }),
});
