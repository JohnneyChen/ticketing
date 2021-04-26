import { OrderCancelledEvent, OrderStatus } from "@johnneychentix/common";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";

import { Order } from "../../../models/Order";
import { natsWrapper } from "../../../NatsWrapper";
import { OrderCancelledListener } from "../orderCancelledListener";

const setup = async () => {
  const order = Order.build({
    id: mongoose.Types.ObjectId().toHexString(),
    price: 100,
    status: OrderStatus.Created,
    version: 0,
    userId: mongoose.Types.ObjectId().toHexString(),
  });

  await order.save();

  const event: OrderCancelledEvent["data"] = {
    id: order.id,
    version: 1,
    ticket: {
      id: mongoose.Types.ObjectId().toHexString(),
    },
  };

  //@ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  const listener = new OrderCancelledListener(natsWrapper.client);

  return { event, msg, listener, order };
};

it("updates order status to cancelled on correct version event", async () => {
  const { listener, event, msg, order } = await setup();

  await listener.onMessage(event, msg);

  const updatedOrder = await Order.findById(order.id);

  expect(updatedOrder!.version).toEqual(1);
  expect(updatedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it("acks after successful update", async () => {
  const { listener, event, msg, order } = await setup();

  await listener.onMessage(event, msg);

  expect(msg.ack).toHaveBeenCalled();
});

it("errors on event with improper version", async () => {
  const { listener, event, msg, order } = await setup();

  event.version = 2;

  try {
    await listener.onMessage(event, msg);
  } catch (err) {
    expect(err.message).toEqual("Order not found");
  }

  expect(msg.ack).not.toHaveBeenCalled();

  const updatedOrder = await Order.findById(order.id);

  expect(updatedOrder!.version).toEqual(0);
  expect(updatedOrder!.status).toEqual(OrderStatus.Created);
});
