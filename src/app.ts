import express from "express";
import cookieParser from "cookie-parser";
import { notFoundHandler } from "./middlewares/notFound.middleware.js";
import { errorHandler } from "./middlewares/error.middleware.js";

const app = express();
app.use(express.json());
app.use(cookieParser());

app.get("/health", (_req, res) => {
  return res.status(200).json({
    success: true,
    message: "Server is healthy",
  });
});

app.use(notFoundHandler);
app.use(errorHandler);
export default app;
