import mongoose from "mongoose";

import { app } from "./app";
import { natsWrapper } from "./NatsWrapper";

const start = async () => {
  if (!process.env.JWT_KEY) {
    throw new Error("JWT_KEY must be defined");
  }

  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI must be defined");
  }

  try {
    await natsWrapper.connect(
      "ticketing",
      "randomstring",
      "http://nats-srv:4222"
    );
    natsWrapper.client.on("close", () => {
      console.log("NATS connection closed!");
      process.exit();
    });
    process.on("SIGTERM", () => {
      natsWrapper.client.close();
    });
    process.on("SIGINT", () => {
      natsWrapper.client.close();
    });

    await mongoose.connect(process.env.MONGO_URI, {
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
