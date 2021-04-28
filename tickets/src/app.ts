import express from "express";
import "express-async-errors";
import { json } from "body-parser";
import cookieSession from "cookie-session";
import {
  currentUser,
  errorHandler,
  NotFoundError,
} from "@johnneychentix/common";

import { newTicketRouter } from "./routes/new";
import { showTicketRouter } from "./routes/show";
import { editTicketRouter } from "./routes/edit";
import { listTicketsRouter } from "./routes/index";

const app = express();

app.set("trust proxy", true);

app.use(json());
app.use(cookieSession({ signed: false, secure: false }));
app.use(currentUser);

app.use(listTicketsRouter);
app.use(showTicketRouter);
app.use(newTicketRouter);
app.use(editTicketRouter);

app.all("*", async () => {
  throw new NotFoundError();
});

app.use(errorHandler);

export { app };
