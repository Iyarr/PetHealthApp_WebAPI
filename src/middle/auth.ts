import { Request, Response, NextFunction } from "express";
import { getValidUidFromToken } from "./firebase.js";

export const tokenAuth = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.header("Authorization");
  if (!token) {
    return res.status(401).send("Authorization header missing");
  }
  if (!token.startsWith("Bearer ")) {
    return res.status(401).send("Authorization header format is invalid");
  }

  const uid = await getValidUidFromToken(token.split(" ")[1]);

  if (uid !== "") {
    req.body.uid = uid;
    next();
  } else {
    return res.status(401).send("Invalid Token");
  }
};
