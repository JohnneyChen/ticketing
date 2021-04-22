import request from "supertest";
import mongoose from "mongoose";

import { app } from "../../app";
import { Ticket } from "../../models/Ticket";
import { Order, OrderStatus } from "../../models/Order";

it("401 on post without authenticated user", async () => {
  await request(app).post("/api/orders").send({}).expect(401);
});

it("400 on post without ticketId", async () => {
  const jwt = global.signin();

  const response = await request(app)
    .post("/api/orders")
    .set("Cookie", jwt)
    .send({})
    .expect(400);

  expect(response.body.errors[0].field).toEqual("ticketId");
  expect(response.body.errors[0].message).toEqual("A ticketId is required");
});

it("404 when ticket posted does not exist", async () => {
  const jwt = global.signin();
  const ticketId = mongoose.Types.ObjectId().toHexString();

  const response = await request(app)
    .post("/api/orders")
    .set("Cookie", jwt)
    .send({ ticketId })
    .expect(404);
});

it("400 when order request on reserved ticket", async () => {
  const jwt = global.signin();
  const userId = mongoose.Types.ObjectId().toHexString();

  const expiration = new Date();
  expiration.setSeconds(expiration.getSeconds() + 60 * 15);

  const ticket = Ticket.build({
    title: "concert",
    price: 100,
  });

  await ticket.save();

  const existingOrder = Order.build({
    userId,
    status: OrderStatus.Created,
    expiresAt: expiration,
    ticket,
  });

  await existingOrder.save();

  const response = await request(app)
    .post("/api/orders")
    .set("Cookie", jwt)
    .send({ ticketId: ticket.id })
    .expect(400);

  expect(response.body.errors[0].message).toEqual("Ticket is already reserved");
});

it("201 and order creation on valid post", async () => {
  const jwt = global.signin();

  const expiration = new Date();
  expiration.setSeconds(expiration.getSeconds() + 60 * 15);

  const ticket = Ticket.build({
    title: "concert",
    price: 100,
  });

  await ticket.save();

  const response = await request(app)
    .post("/api/orders")
    .set("Cookie", jwt)
    .send({ ticketId: ticket.id })
    .expect(201);
});

// it("sends orders:created event on successful request", async () => {});
