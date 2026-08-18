import express from "express";
import morgan from "morgan";
import cors from "cors";
import cookieParser from "cookie-parser";
import { notFoundHandler } from "./middlewares/notFound.middleware.js";
import { errorHandler } from "./middlewares/error.middleware.js";
import routes from "./routes/index.js";
import { env } from "./config/env.js";
import helmet from "helmet";

const app = express();

const corsOptions = {
  origin: env.FRONTEND_URL,
  credential: true,
};

// Security headers
app.use(helmet());

// CORS
app.use(cors(corsOptions));

// Request logging
app.use(morgan("dev"));

// Request body limit
app.use(express.json({ limit: "10kb" }));

app.use(
  express.urlencoded({
    extended: true,
    limit: "10kb",
  }),
);

app.use(cookieParser());

app.use("/api/v1", routes);

app.use(notFoundHandler);
app.use(errorHandler);
export default app;
