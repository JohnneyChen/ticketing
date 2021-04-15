import express from "express";
import "express-async-errors";
import { json } from "body-parser";
import cookieSession from "cookie-session";
import {
  currentUser,
  errorHandler,
  NotFoundError,
} from "@johnneychentix/common";

import { newRouter } from "./routes/new";
import { showRouter } from "./routes/show";
import { editRouter } from "./routes/edit";
import { listRouter } from "./routes/list";

const app = express();

app.set("trust proxy", true);

app.use(json());
app.use(
  cookieSession({ signed: false, secure: process.env.NODE_ENV !== "test" })
);
app.use(currentUser);

app.use(listRouter);
app.use(showRouter);
app.use(newRouter);
app.use(editRouter);

app.all("*", async () => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
