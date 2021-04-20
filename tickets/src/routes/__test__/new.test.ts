import request from "supertest";
import { app } from "../../app";

import { Ticket } from "../../models/Ticket";
import { natsWrapper } from "../../NatsWrapper";

it("has route handler for POST to path /api/tickets", async () => {
  const response = await request(app).post("/api/tickets").send({});

  expect(response.status).not.toEqual(404);
});

it("must be authenticated to access route", async () => {
  await request(app).post("/api/tickets").send({}).expect(401);
});

it("returns a status not 401 if user is authenticated", async () => {
  const authCookie = global.signin();

  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", authCookie)
    .send({});

  expect(response.status).not.toEqual(401);
});

it("error on invalid title", async () => {
  const authCookie = global.signin();

  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", authCookie)
    .send({ price: 15 })
    .expect(400);

  expect(response.body.errors[0].message).toEqual("A valid title is required");
  expect(response.body.errors[0].field).toEqual("title");
});

it("error on invalid price", async () => {
  const authCookie = global.signin();

  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", authCookie)
    .send({ title: "test" })
    .expect(400);

  expect(response.body.errors[0].message).toEqual(
    "A valid price (greater than 0) is required"
  );
  expect(response.body.errors[0].field).toEqual("price");
});

it("creates a ticket with valid inputs", async () => {
  let tickets = await Ticket.find({});
  expect(tickets.length).toEqual(0);

  const authCookie = global.signin();

  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", authCookie)
    .send({ title: "test", price: 15 })
    .expect(201);

  expect(response.body.title).toEqual("test");
  expect(response.body.price).toEqual(15);

  tickets = await Ticket.find({});
  expect(tickets.length).toEqual(1);
});

it("publishes event on succesful ticket created", async () => {
  const authCookie = global.signin();

  const response = await request(app)
    .post("/api/tickets")
    .set("Cookie", authCookie)
    .send({ title: "test", price: 15 })
    .expect(201);

  expect(natsWrapper.client.publish).toHaveBeenCalled();
});
