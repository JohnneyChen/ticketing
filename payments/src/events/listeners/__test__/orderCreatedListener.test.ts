import { OrderCreatedEvent, OrderStatus } from "@johnneychentix/common";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";

import { Order } from "../../../models/Order";
import { natsWrapper } from "../../../NatsWrapper";
import { OrderCreatedListener } from "../orderCreatedListener";

const setup = async () => {
  const event: OrderCreatedEvent["data"] = {
    id: mongoose.Types.ObjectId().toHexString(),
    version: 0,
    status: OrderStatus.Created,
    userId: mongoose.Types.ObjectId().toHexString(),
    expiresAt: "test",
    ticket: {
      id: mongoose.Types.ObjectId().toHexString(),
      price: 500,
    },
  };

  //@ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  const listener = new OrderCreatedListener(natsWrapper.client);

  return { event, msg, listener };
};

it("creates a new order", async () => {
  const { event, msg, listener } = await setup();

  await listener.onMessage(event, msg);

  const order = await Order.findById(event.id);

  expect(order!.version).toEqual(event.version);
  expect(order!.price).toEqual(event.ticket.price);
});

it("acks after creating a new order", async () => {
  const { event, msg, listener } = await setup();

  await listener.onMessage(event, msg);

  expect(msg.ack).toHaveBeenCalled();
});
