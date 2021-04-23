import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { TicketCreatedEvent } from "@johnneychentix/common";

import { TicketCreatedListener } from "../ticketCreatedListener";
import { natsWrapper } from "../../../NatsWrapper";
import { Ticket } from "../../../models/Ticket";

const setUp = async () => {
  const listener = new TicketCreatedListener(natsWrapper.client);

  const event: TicketCreatedEvent["data"] = {
    id: mongoose.Types.ObjectId().toHexString(),
    version: 0,
    title: "concert",
    price: 120,
    userId: mongoose.Types.ObjectId().toHexString(),
  };

  //@ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, event, msg };
};

it("saves a document when onMessage is called", async () => {
  const { listener, event, msg } = await setUp();

  await listener.onMessage(event, msg);

  const ticket = await Ticket.findById(event.id);

  expect(ticket).toBeDefined();
  expect(ticket!.title).toEqual("concert");
  expect(ticket!.price).toEqual(120);
});

it("calls msg.ack() when event is successfully processed", async () => {
  const { listener, event, msg } = await setUp();

  await listener.onMessage(event, msg);

  const ticket = await Ticket.findById(event.id);

  expect(msg.ack).toHaveBeenCalled();
});
