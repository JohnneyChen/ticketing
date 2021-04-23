import request from "supertest";
import mongoose from "mongoose";

import { app } from "../../app";
import { Ticket } from "../../models/Ticket";
import { Order, OrderStatus } from "../../models/Order";
import { natsWrapper } from "../../NatsWrapper";

it("401 on unauthorized access", async () => {
  const response = await request(app)
    .delete("/api/orders/id")
    .send()
    .expect(401);

  expect(response.body.errors[0].message).toEqual(
    "Forbidden unauthorized access"
  );

  expect(natsWrapper.client.publish).not.toHaveBeenCalled();
});

it("404 on request with non-existent order", async () => {
  const jwt = global.signin();
  const id = mongoose.Types.ObjectId().toHexString();

  await request(app)
    .delete(`/api/orders/${id}`)
    .set("Cookie", jwt)
    .send()
    .expect(404);

  expect(natsWrapper.client.publish).not.toHaveBeenCalled();
});

it("401 on unauthorized access of existing order", async () => {
  const jwt = global.signin();
  const userId = mongoose.Types.ObjectId().toHexString();
  const expiration = new Date();
  expiration.setSeconds(expiration.getSeconds() + 15 * 60);

  const ticket = Ticket.build({
    title: "Concert",
    price: 100,
    _id: mongoose.Types.ObjectId().toHexString(),
  });

  await ticket.save();

  const order = Order.build({
    ticket,
    userId,
    status: OrderStatus.Created,
    expiresAt: expiration,
  });

  await order.save();

  const response = await request(app)
    .delete(`/api/orders/${order.id}`)
    .set("Cookie", jwt)
    .send()
    .expect(401);

  expect(response.body.errors[0].message).toEqual(
    "Forbidden unauthorized access"
  );

  expect(natsWrapper.client.publish).not.toHaveBeenCalled();
});

it("204 and changes order to cancelled on authorized access", async () => {
  const jwt = global.signin();
  const userId = "6076381c4e3b30c0fad4ce39";
  const expiration = new Date();
  expiration.setSeconds(expiration.getSeconds() + 15 * 60);

  const ticket = Ticket.build({
    title: "Concert",
    price: 100,
    _id: mongoose.Types.ObjectId().toHexString(),
  });

  await ticket.save();

  const order = Order.build({
    ticket,
    userId,
    status: OrderStatus.Created,
    expiresAt: expiration,
  });

  await order.save();

  const response = await request(app)
    .delete(`/api/orders/${order.id}`)
    .set("Cookie", jwt)
    .send()
    .expect(204);

  const changedOrder = await Order.findById(order.id);

  expect(changedOrder!.status).toEqual(OrderStatus.Cancelled);
});

it("publishes an order cancelled event after successful request", async () => {
  const jwt = global.signin();
  const userId = "6076381c4e3b30c0fad4ce39";
  const expiration = new Date();
  expiration.setSeconds(expiration.getSeconds() + 15 * 60);

  const ticket = Ticket.build({
    title: "Concert",
    price: 100,
    _id: mongoose.Types.ObjectId().toHexString(),
  });

  await ticket.save();

  const order = Order.build({
    ticket,
    userId,
    status: OrderStatus.Created,
    expiresAt: expiration,
  });

  await order.save();

  const response = await request(app)
    .delete(`/api/orders/${order.id}`)
    .set("Cookie", jwt)
    .send()
    .expect(204);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
