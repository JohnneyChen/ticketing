import { OrderStatus } from "@johnneychentix/common";
import mongoose from "mongoose";
import request from "supertest";

import { app } from "../../app";
import { Order } from "../../models/Order";
import { Payment } from "../../models/Payment";
import { stripe } from "../../stripe";
import { natsWrapper } from "../../NatsWrapper";

it("401 on unauthorized access of route", async () => {
  await request(app).post("/api/payments").send().expect(401);
});

it("400 if fields orderId or token is missing", async () => {
  const jwt = global.signin();

  const responseOne = await request(app)
    .post("/api/payments")
    .set("Cookie", jwt)
    .send({ orderId: mongoose.Types.ObjectId().toHexString() })
    .expect(400);

  expect(responseOne.body.errors[0].message).toEqual("Valid token required");
  expect(responseOne.body.errors[0].field).toEqual("token");

  const responseTwo = await request(app)
    .post("/api/payments")
    .set("Cookie", jwt)
    .send({ token: "testtoken" })
    .expect(400);

  expect(responseTwo.body.errors[0].message).toEqual("Valid orderId required");
  expect(responseTwo.body.errors[0].field).toEqual("orderId");
});

it("404s on not found order", async () => {
  const jwt = global.signin();

  const responseOne = await request(app)
    .post("/api/payments")
    .set("Cookie", jwt)
    .send({
      orderId: mongoose.Types.ObjectId().toHexString(),
      token: "testtoken",
    })
    .expect(404);
});

it("401s when current user is not user associated with order", async () => {
  const order = Order.build({
    userId: mongoose.Types.ObjectId().toHexString(),
    price: 500,
    status: OrderStatus.Created,
    id: mongoose.Types.ObjectId().toHexString(),
    version: 0,
  });

  await order.save();

  const jwt = global.signin();

  const responseOne = await request(app)
    .post("/api/payments")
    .set("Cookie", jwt)
    .send({
      orderId: order.id,
      token: "testtoken",
    })
    .expect(401);
});

it("400 if order is cancelled", async () => {
  const userId = "6076381c4e3b30c0fad4ce39";

  const order = Order.build({
    userId,
    price: 500,
    status: OrderStatus.Cancelled,
    id: mongoose.Types.ObjectId().toHexString(),
    version: 0,
  });

  await order.save();

  const jwt = global.signin();

  const response = await request(app)
    .post("/api/payments")
    .set("Cookie", jwt)
    .send({
      orderId: order.id,
      token: "testtoken",
    })
    .expect(400);

  expect(response.body.errors[0].message).toEqual(
    "Cannot pay for cancelled order"
  );
});

it("201 and creates stripe charge on valid token and order", async () => {
  const price = Math.floor(Math.random() * 100000);
  const userId = "6076381c4e3b30c0fad4ce39";
  const jwt = global.signin();

  const order = Order.build({
    userId,
    price,
    status: OrderStatus.Created,
    id: mongoose.Types.ObjectId().toHexString(),
    version: 0,
  });

  await order.save();

  const response = await request(app)
    .post("/api/payments")
    .set("Cookie", jwt)
    .send({
      orderId: order.id,
      token: "tok_visa",
    })
    .expect(201);

  const charges = await stripe.charges.list();

  const charge = charges.data.find((charge) => {
    return charge.amount === price * 100;
  });

  expect(charge).toBeDefined();
});

it("201 and creates payment record", async () => {
  const price = Math.floor(Math.random() * 100000);
  const userId = "6076381c4e3b30c0fad4ce39";
  const jwt = global.signin();

  const order = Order.build({
    userId,
    price,
    status: OrderStatus.Created,
    id: mongoose.Types.ObjectId().toHexString(),
    version: 0,
  });

  await order.save();

  const response = await request(app)
    .post("/api/payments")
    .set("Cookie", jwt)
    .send({
      orderId: order.id,
      token: "tok_visa",
    })
    .expect(201);

  const charges = await stripe.charges.list();

  const charge = charges.data.find((charge) => {
    return charge.amount === price * 100;
  });

  expect(charge).toBeDefined();

  const payment = await Payment.findOne({
    orderId: order.id,
    chargeId: charge!.id,
  });

  expect(payment).not.toBeNull();
});

it("publishes payment:created event after valid request", async () => {
  const price = Math.floor(Math.random() * 100000);
  const userId = "6076381c4e3b30c0fad4ce39";
  const jwt = global.signin();

  const order = Order.build({
    userId,
    price,
    status: OrderStatus.Created,
    id: mongoose.Types.ObjectId().toHexString(),
    version: 0,
  });

  await order.save();

  const response = await request(app)
    .post("/api/payments")
    .set("Cookie", jwt)
    .send({
      orderId: order.id,
      token: "tok_visa",
    })
    .expect(201);

  const charges = await stripe.charges.list();

  const charge = charges.data.find((charge) => {
    return charge.amount === price * 100;
  });

  expect(charge).toBeDefined();

  const payment = await Payment.findOne({
    orderId: order.id,
    chargeId: charge!.id,
  });

  expect(payment).not.toBeNull();

  const eventData = JSON.parse(
    (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
  );
  expect(natsWrapper.client.publish).toBeCalled();
  expect(eventData.orderId).toEqual(order.id);
  expect(eventData.chargeId).toEqual(charge!.id);
  expect(eventData.id).toEqual(payment!.id);
});
