import mongoose from "mongoose";

import { app } from "./app";
import { natsWrapper } from "./NatsWrapper";
import { TicketCreatedListener } from "./events/listeners/ticketCreatedListener";
import { TicketEditedListener } from "./events/listeners/ticketEditedListener";
import { ExpirationCompleteListener } from "./events/listeners/expirationCompleteListener";
import { PaymentCreatedListener } from "./events/listeners/paymentCreatedListener";

const start = async () => {
  console.log("starting up.........");
  if (!process.env.JWT_KEY) {
    throw new Error("JWT_KEY must be defined");
  }

  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI must be defined");
  }

  if (!process.env.NATS_CLUSTER_ID) {
    throw new Error("NATS_CLUSTER_ID must be defined");
  }

  if (!process.env.NATS_CLIENT_ID) {
    throw new Error("NATS_CLIENT_ID must be defined");
  }

  if (!process.env.NATS_URL) {
    throw new Error("NATS_URL must be defined");
  }

  try {
    await natsWrapper.connect(
      process.env.NATS_CLUSTER_ID,
      process.env.NATS_CLIENT_ID,
      process.env.NATS_URL
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

    new TicketCreatedListener(natsWrapper.client).listen();
    new TicketEditedListener(natsWrapper.client).listen();
    new ExpirationCompleteListener(natsWrapper.client).listen();
    new PaymentCreatedListener(natsWrapper.client).listen();

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
