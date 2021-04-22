import request from "supertest";
import mongoose from "mongoose";

import { app } from "../../app";
import { Ticket } from "../../models/Ticket";
import { Order, OrderStatus } from "../../models/Order";

it("401 on unauthorized access", async () => {
  const response = await request(app)
    .delete("/api/orders/id")
    .send()
    .expect(401);

  expect(response.body.errors[0].message).toEqual(
    "Forbidden unauthorized access"
  );
});

it("404 on request with non-existent order", async () => {
  const jwt = global.signin();
  const id = mongoose.Types.ObjectId().toHexString();

  await request(app)
    .delete(`/api/orders/${id}`)
    .set("Cookie", jwt)
    .send()
    .expect(404);
});

it("401 on unauthorized access of existing order", async () => {
  const jwt = global.signin();
  const userId = mongoose.Types.ObjectId().toHexString();
  const expiration = new Date();
  expiration.setSeconds(expiration.getSeconds() + 15 * 60);

  const ticket = Ticket.build({
    title: "Concert",
    price: 100,
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
});

it("200 and deletes order on authorized access", async () => {
  const jwt = global.signin();
  const userId = "6076381c4e3b30c0fad4ce39";
  const expiration = new Date();
  expiration.setSeconds(expiration.getSeconds() + 15 * 60);

  const ticket = Ticket.build({
    title: "Concert",
    price: 100,
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
    .expect(200);

  const orders = await Order.find({});
  expect(orders.length).toEqual(0);
});
