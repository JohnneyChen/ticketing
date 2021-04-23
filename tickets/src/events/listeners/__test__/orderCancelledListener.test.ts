import mongoose from "mongoose";
import { OrderCancelledEvent, OrderStatus } from "@johnneychentix/common";

import { OrderCancelledListener } from "../orderCancelledListener";
import { Ticket } from "../../../models/Ticket";
import { natsWrapper } from "../../../NatsWrapper";

const setup = async () => {
  const ticket = Ticket.build({
    title: "concert",
    price: 100,
    userId: mongoose.Types.ObjectId().toHexString(),
  });

  await ticket.save();

  ticket.set({ orderId: mongoose.Types.ObjectId().toHexString() });
  await ticket.save();

  const listener = new OrderCancelledListener(natsWrapper.client);

  const event: OrderCancelledEvent["data"] = {
    id: mongoose.Types.ObjectId().toHexString(),
    version: 0,
    ticket: {
      id: ticket.id,
    },
  };

  //@ts-ignore
  const msg: Message = {
    ack: jest.fn(),
  };

  return { ticket, listener, event, msg };
};

it("unsets orderId after recieving event", async () => {
  const { ticket, listener, event, msg } = await setup();

  await listener.onMessage(event, msg);

  const updatedTicket = await Ticket.findById(ticket.id);

  expect(updatedTicket!.orderId).toBeUndefined();
  expect(updatedTicket!.version).toEqual(2);
});

it("unsets orderId after recieving event", async () => {
  const { ticket, listener, event, msg } = await setup();

  await listener.onMessage(event, msg);

  expect(msg.ack).toHaveBeenCalled();
});

it("published ticket edited event", async () => {
  const { ticket, listener, event, msg } = await setup();

  await listener.onMessage(event, msg);

  const { orderId, version, id } = JSON.parse(
    (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
  );
  expect(orderId).toBeUndefined();
  expect(version).toEqual(2);
  expect(id).toEqual(ticket.id);
});
