import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { TicketEditedEvent } from "@johnneychentix/common";

import { TicketEditedListener } from "../ticketEditedListener";
import { natsWrapper } from "../../../NatsWrapper";
import { Ticket } from "../../../models/Ticket";

const setUp = async () => {
  const listener = new TicketEditedListener(natsWrapper.client);

  const ticket = Ticket.build({
    title: "concert",
    price: 200,
    _id: mongoose.Types.ObjectId().toHexString(),
  });

  await ticket.save();

  const event: TicketEditedEvent["data"] = {
    id: ticket.id,
    version: 1,
    title: "baseball",
    price: 5000,
    userId: mongoose.Types.ObjectId().toHexString(),
  };

  //@ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { listener, msg, event, ticket };
};

it("successfully updates record on correctly versioned event", async () => {
  const { listener, msg, event, ticket } = await setUp();

  await listener.onMessage(event, msg);

  const updatedTicket = await Ticket.findById(ticket.id);

  expect(updatedTicket!.title).toEqual(event.title);
  expect(updatedTicket!.price).toEqual(event.price);
  expect(updatedTicket!.version).toEqual(event.version);
});

it("successfully calls msg.ack() on correctly versioned event", async () => {
  const { listener, msg, event } = await setUp();

  await listener.onMessage(event, msg);

  expect(msg.ack).toHaveBeenCalled();
});

it("doesn't update on event with incorrect version", async (done) => {
  const { listener, msg, event, ticket } = await setUp();

  event.version = 2;

  try {
    await listener.onMessage(event, msg);
  } catch (err) {
    expect(err.message).toEqual("Ticket not found");

    const updatedTicket = await Ticket.findById(ticket.id);

    expect(updatedTicket!.title).toEqual(ticket.title);
    expect(updatedTicket!.price).toEqual(ticket.price);
    expect(updatedTicket!.version).toEqual(0);
    return done();
  }
});

it("doesn't acknowledge event with incorrect version", async (done) => {
  const { listener, msg, event } = await setUp();

  event.version = 2;

  try {
    await listener.onMessage(event, msg);
  } catch (err) {
    expect(err.message).toEqual("Ticket not found");
    expect(msg.ack).not.toHaveBeenCalled();
    return done();
  }
});
