import app from "./app.js";
import { connectDB } from "./config/db.js";
import { env } from "./config/env.js";

const startServer = async (): Promise<void> => {
  await connectDB();
  app.listen(env.PORT, () => {
    console.log(
      `Server is running in ${env.NODE_ENV} mode on port ${env.PORT}`,
    );
  });
};

startServer();
