import { initializeApp, cert } from "firebase-admin/app";
import { env } from "./env.js";

export const FirebaseApp = initializeApp({
  credential: cert({
    projectId: env.FIREBASE_PROJECT_ID,
    clientEmail: env.FIREBASE_CLIENT_EMAIL,
    privateKey: env.FIREBASE_PRIVATE_KEY.replaceAll("\\n", "\n"),
  }),
});
