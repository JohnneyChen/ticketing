import mongoose from "mongoose";
import { OrderCreatedEvent, OrderStatus } from "@johnneychentix/common";

import { OrderCreatedListener } from "../orderCreatedListener";
import { Ticket } from "../../../models/Ticket";
import { natsWrapper } from "../../../NatsWrapper";

const setup = async () => {
  const ticket = Ticket.build({
    title: "concert",
    price: 100,
    userId: mongoose.Types.ObjectId().toHexString(),
  });

  await ticket.save();

  const listener = new OrderCreatedListener(natsWrapper.client);

  const event: OrderCreatedEvent["data"] = {
    id: mongoose.Types.ObjectId().toHexString(),
    version: 0,
    status: OrderStatus.Created,
    userId: mongoose.Types.ObjectId().toHexString(),
    expiresAt: "date",
    ticket: {
      id: ticket.id,
      price: ticket.price,
    },
  };

  //@ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { ticket, listener, event, msg };
};

it("sets orderId after receiving event", async () => {
  const { ticket, listener, event, msg } = await setup();

  await listener.onMessage(event, msg);

  const updatedTicket = await Ticket.findById(ticket.id);

  expect(updatedTicket!.orderId).toEqual(event.id);
  expect(updatedTicket!.version).toEqual(1);
});

it("acks after successful process of event", async () => {
  const { ticket, listener, event, msg } = await setup();

  await listener.onMessage(event, msg);

  expect(msg.ack).toHaveBeenCalled();
});

it("publishes ticket edited event", async () => {
  const { ticket, listener, event, msg } = await setup();

  await listener.onMessage(event, msg);

  const { orderId, version, id } = JSON.parse(
    (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
  );
  expect(orderId).toEqual(event.id);
  expect(version).toEqual(1);
  expect(id).toEqual(ticket.id);
});
