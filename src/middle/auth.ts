import { Request, Response, NextFunction } from "express";
import { getAuth } from "firebase-admin/auth";

export const tokenAuth = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.header("Authorization");
  if (!token) {
    return res.status(401).send("Authorization header missing");
  }
  if (!token.startsWith("Bearer ")) {
    return res.status(401).send("Authorization header format is invalid");
  }

  const firebase = req.app.get("firebase");
  const auth = getAuth(firebase);
  const decodedToken = await auth.verifyIdToken(token.split(" ")[1]);
  // 他にもトークンを検証する処理を追加する
  if (decodedToken.aud !== firebase.options.projectId) {
    return res.status(401).send("Token is invalid");
  }

  req.body.uid = decodedToken.uid;

  next();
};
