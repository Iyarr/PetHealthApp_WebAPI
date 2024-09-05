import { initializeApp, cert, App } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getEnv } from "../utils/env.js";

export class Firebase {
  private project_id: string;
  private client_email: string;
  private private_key: string;
  private App: App;
  constructor() {
    this.project_id = getEnv("FIREBASE_PROJECT_ID");
    this.client_email = getEnv("FIREBASE_CLIENT_EMAIL");
    this.private_key = getEnv("FIREBASE_PRIVATE_KEY").replaceAll("\\n", "\n");
    this.App = initializeApp({
      credential: cert({
        projectId: this.project_id,
        privateKey: this.private_key,
        clientEmail: this.client_email,
      }),
    });
  }

  getProjectId() {
    return this.project_id;
  }

  getAuth() {
    return getAuth(this.App);
  }

  getApp() {
    return this.App;
  }
}
