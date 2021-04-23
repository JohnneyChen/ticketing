import { OrderStatus } from "@johnneychentix/common";
import mongoose from "mongoose";

import { Ticket } from "../Ticket";
import { Order } from "../Order";

it("Error on edit with improper version number", async (done) => {
  const expiration = new Date();
  expiration.setSeconds(expiration.getSeconds() + 15 * 60);

  const ticket = Ticket.build({
    title: "concert",
    price: 200,
    _id: mongoose.Types.ObjectId().toHexString(),
  });

  const order = Order.build({
    userId: mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    expiresAt: expiration,
    ticket,
  });

  await order.save();

  const instanceOne = await Order.findById(order.id);
  const instanceTwo = await Order.findById(order.id);

  instanceOne!.set({ status: OrderStatus.Complete });
  await instanceOne!.save();

  instanceTwo!.set({ status: OrderStatus.Complete });
  try {
    await instanceTwo!.save();
  } catch (err) {
    expect(err).toBeInstanceOf(mongoose.Error.VersionError);
    return done();
  }

  throw new Error("Should not reach this code");
});

it("Proper version incrementation on save", async () => {
  const expiration = new Date();
  expiration.setSeconds(expiration.getSeconds() + 15 * 60);

  const ticket = Ticket.build({
    title: "concert",
    price: 200,
    _id: mongoose.Types.ObjectId().toHexString(),
  });

  const order = Order.build({
    userId: mongoose.Types.ObjectId().toHexString(),
    status: OrderStatus.Created,
    expiresAt: expiration,
    ticket,
  });

  await order.save();
  expect(order.version).toEqual(0);
  await order.save();
  expect(order.version).toEqual(1);
  await order.save();
  expect(order.version).toEqual(2);
});
