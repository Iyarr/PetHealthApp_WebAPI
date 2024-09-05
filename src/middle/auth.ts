import { Request, Response, NextFunction } from "express";

export const tokenAuth = async (req: Request, res: Response, next: NextFunction) => {
  const token = req.header("Authorization");
  if (!token) {
    return res.status(401).send("Authorization header missing");
  }
  if (!token.startsWith("Bearer ")) {
    return res.status(401).send("Authorization header format is invalid");
  }
  try {
    next();
  } catch (err) {
    res.status(400).send("Invalid Token");
  }
};
