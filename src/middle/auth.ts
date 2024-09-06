import { Request, Response, NextFunction } from "express";
import { FirebaseApp } from "../utils/firebase.js";
import { getAuth } from "firebase-admin/auth";
import { confirmDecodedTokenIsValid } from "../utils/firebase.js";

export const tokenAuth = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.header("Authorization");
  if (!token) {
    return res.status(401).send("Authorization header missing");
  }
  if (!token.startsWith("Bearer ")) {
    return res.status(401).send("Authorization header format is invalid");
  }

  const auth = getAuth(FirebaseApp);
  const decodedIdToken = await auth.verifyIdToken(token);

  if (confirmDecodedTokenIsValid(decodedIdToken)) {
    req.body.uid = decodedIdToken.aud;
    next();
  } else {
    return res.status(401).send("Invalid Token");
  }
};
