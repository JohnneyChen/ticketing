import request from "supertest";
import mongoose from "mongoose";

import { Ticket } from "../../models/Ticket";
import { app } from "../../app";
import { natsWrapper } from "../../NatsWrapper";

it("401 if unauthorized route access", async () => {
  const id = mongoose.Types.ObjectId().toHexString();

  await request(app).put(`/api/tickets/${id}`).send({ price: 15 }).expect(401);
});

it("error if invalid ticket title", async () => {
  const id = mongoose.Types.ObjectId().toHexString();

  const authToken = global.signin();

  const { body } = await request(app)
    .put(`/api/tickets/${id}`)
    .send({ price: 15 })
    .set("Cookie", authToken)
    .expect(400);

  expect(body.errors[0].message).toEqual("A valid title is required");
  expect(body.errors[0].field).toEqual("title");
});

it("error if invalid ticket price", async () => {
  const id = mongoose.Types.ObjectId().toHexString();

  const authToken = global.signin();

  const { body } = await request(app)
    .put(`/api/tickets/${id}`)
    .send({ title: "concert" })
    .set("Cookie", authToken)
    .expect(400);

  expect(body.errors[0].message).toEqual(
    "A valid price (greater than 0) is required"
  );
  expect(body.errors[0].field).toEqual("price");
});

it("404 if no ticket with searched id", async () => {
  const id = mongoose.Types.ObjectId().toHexString();

  const authToken = global.signin();

  await request(app)
    .put(`/api/tickets/${id}`)
    .send({ title: "concert", price: 50 })
    .set("Cookie", authToken)
    .expect(404);
});

it("401 if userId does not match ticket userId", async () => {
  const userId = mongoose.Types.ObjectId().toHexString();

  const ticket = Ticket.build({ title: "Concert", price: 20, userId });
  await ticket.save();

  const authToken = global.signin();

  const { body } = await request(app)
    .put(`/api/tickets/${ticket.id}`)
    .send({ title: "music concert", price: "50" })
    .set("Cookie", authToken)
    .expect(401);
});

it("200 if valid request parameters and valid userId edit on existing ticket", async () => {
  const userId = "6076381c4e3b30c0fad4ce39";

  const ticket = Ticket.build({ title: "Concert", price: 20, userId });
  await ticket.save();

  const authToken = global.signin();

  const { body } = await request(app)
    .put(`/api/tickets/${ticket.id}`)
    .send({ title: "music concert", price: "50" })
    .set("Cookie", authToken)
    .expect(200);

  expect(body.title).toEqual("music concert");
  expect(body.price).toEqual(50);

  const getResponse = await request(app)
    .get(`/api/tickets/${ticket.id}`)
    .expect(200);

  expect(getResponse.body.title).toEqual("music concert");
  expect(getResponse.body.price).toEqual(50);
});

it("published event after successful ticket edited", async () => {
  const userId = "6076381c4e3b30c0fad4ce39";

  const ticket = Ticket.build({ title: "Concert", price: 20, userId });
  await ticket.save();

  const authToken = global.signin();

  const { body } = await request(app)
    .put(`/api/tickets/${ticket.id}`)
    .send({ title: "music concert", price: "50" })
    .set("Cookie", authToken)
    .expect(200);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
