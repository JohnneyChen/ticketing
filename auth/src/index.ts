import express from "express";
import "express-async-errors";
import { json } from "body-parser";
import mongoose from "mongoose";
import cookieSession from "cookie-session";

import { currentUserRouter } from "./routes/currentUser";
import { signoutRouter } from "./routes/signout";
import { signinRouter } from "./routes/signin";
import { signupRouter } from "./routes/signup";
import { errorHandler } from "./middleware/errorHandler";
import { NotFoundError } from "./errors/notFoundError";

const app = express();

app.set("trust proxy", true);

app.use(json());
app.use(cookieSession({ signed: false, secure: true }));

app.use(currentUserRouter);
app.use(signoutRouter);
app.use(signupRouter);
app.use(signinRouter);

app.all("*", async () => {
  throw new NotFoundError();
});

app.use(errorHandler);

const start = async () => {
  if (!process.env.JWT_KEY) {
    throw new Error("JWT_KEY must be defined");
  }

  try {
    await mongoose.connect("mongodb://auth-mongo-srv:27017/auth", {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true,
    });
    console.log("connected to mongodb");
  } catch (e) {
    console.log(e);
  }

  app.listen(3000, () => {
    console.log("server listening on port 3000");
  });
};

start();
