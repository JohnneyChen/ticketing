import { Message } from "node-nats-streaming";
import { ExpirationCompleteEvent } from "@johnneychentix/common";
import mongoose from "mongoose";

import { natsWrapper } from "../../../NatsWrapper";
import { ExpirationCompleteListener } from "../expirationCompleteListener";
import { Ticket } from "../../../models/Ticket";
import { Order, OrderStatus } from "../../../models/Order";

const setup = async () => {
  const listener = new ExpirationCompleteListener(natsWrapper.client);

  //@ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  const ticket = Ticket.build({
    title: "concert",
    _id: mongoose.Types.ObjectId().toHexString(),
    price: 200,
  });

  await ticket.save();

  const expiration = new Date();
  expiration.setSeconds(expiration.getSeconds() + 15 * 60);

  const order = Order.build({
    userId: mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    expiresAt: expiration,
    ticket,
  });

  await order.save();

  const event: ExpirationCompleteEvent["data"] = {
    orderId: order.id,
  };

  return { listener, msg, ticket, order, event };
};

it("sets order with status created to cancelled", async () => {
  const { listener, msg, ticket, order, event } = await setup();

  await listener.onMessage(event, msg);

  const updatedOrder = await Order.findById(order.id);

  expect(updatedOrder?.status).toEqual(OrderStatus.Cancelled);
});

it("acks the event after successful process", async () => {
  const { listener, msg, ticket, order, event } = await setup();

  await listener.onMessage(event, msg);

  expect(msg.ack).toHaveBeenCalled();
});

it("sends event of order cancelled after processing event", async () => {
  const { listener, msg, ticket, order, event } = await setup();

  await listener.onMessage(event, msg);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});

it("does not publish order cancelled event or update order on payment completed order", async () => {
  const { listener, msg, ticket, order, event } = await setup();

  order.set({ status: OrderStatus.Complete });
  await order.save();

  await listener.onMessage(event, msg);

  const updatedOrder = await Order.findById(order.id);

  expect(updatedOrder!.status).toEqual(OrderStatus.Complete);
  expect(msg.ack).toHaveBeenCalled();
  expect(natsWrapper.client.publish).not.toHaveBeenCalled();
});
