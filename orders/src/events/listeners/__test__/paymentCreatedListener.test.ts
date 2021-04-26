import { OrderStatus, PaymentCreatedEvent } from "@johnneychentix/common";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";

import { natsWrapper } from "../../../NatsWrapper";
import { PaymentCreatedListener } from "../paymentCreatedListener";
import { Order } from "../../../models/Order";
import { Ticket } from "../../../models/Ticket";

const setup = async () => {
  const listener = new PaymentCreatedListener(natsWrapper.client);

  const ticket = Ticket.build({
    title: "concert",
    price: 20,
    _id: mongoose.Types.ObjectId().toHexString(),
  });

  await ticket.save();

  const order = Order.build({
    userId: mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    expiresAt: new Date(),
    ticket,
  });

  await order.save();

  const event: PaymentCreatedEvent["data"] = {
    id: mongoose.Types.ObjectId().toHexString(),
    orderId: order.id,
    chargeId: "randomid",
  };

  //@ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { ticket, listener, order, event, msg };
};

it("updates order status to complete", async () => {
  const { ticket, listener, order, event, msg } = await setup();

  await listener.onMessage(event, msg);

  const updatedOrder = await Order.findById(order.id);
  expect(updatedOrder!.status).toEqual(OrderStatus.Complete);
});

it("acks the message", async () => {
  const { ticket, listener, order, event, msg } = await setup();

  await listener.onMessage(event, msg);

  expect(msg.ack).toHaveBeenCalled();
});
