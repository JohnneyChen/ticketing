import request from "supertest";
import mongoose from "mongoose";

import { app } from "../../app";
import { Ticket } from "../../models/Ticket";
import { Order, OrderStatus } from "../../models/Order";

it("401 on unauthorized access", async () => {
  const response = await request(app).get("/api/orders").send().expect(401);

  expect(response.body.errors[0].message).toEqual(
    "Forbidden unauthorized access"
  );
});

it("200 and returns correct orders on authorized access", async () => {
  const webtoken = global.signin();
  const userId = "6076381c4e3b30c0fad4ce39";

  await request(app)
    .get("/api/orders")
    .set("Cookie", webtoken)
    .send()
    .expect(200);

  const expiration = new Date();
  expiration.setSeconds(expiration.getSeconds() + 60 * 15);

  const ticket = Ticket.build({
    title: "concert",
    price: 100,
  });

  await ticket.save();

  const ticketTwo = Ticket.build({
    title: "movie",
    price: 10,
  });

  await ticketTwo.save();

  const order = Order.build({
    userId,
    ticket,
    status: OrderStatus.Complete,
    expiresAt: expiration,
  });

  await order.save();

  const orderTwo = Order.build({
    userId,
    ticket: ticketTwo,
    status: OrderStatus.Complete,
    expiresAt: expiration,
  });

  await orderTwo.save();

  const response = await request(app)
    .get("/api/orders")
    .set("Cookie", webtoken)
    .send()
    .expect(200);

  expect(response.body.length).toEqual(2);
});
