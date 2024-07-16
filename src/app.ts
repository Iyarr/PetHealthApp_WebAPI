import express, { Request, Response } from "express";

const app = express();
app.use(express.json());

app.get("/", (req: Request, res: Response) => {
  const body = req.body;
  res.json(body);
});

app.listen(3000, () => console.log("API Server is running on port 3000"));
