import request from "supertest";
import { app } from "../../app";
import mongoose from "mongoose";
import { Ticket } from "../../models/Ticket";

it("404 if ticket not found", async () => {
  const id = mongoose.Types.ObjectId().toHexString();

  await request(app).get(`/api/tickets/${id}`).send().expect(404);
});

it("200 and returns ticket info on valid request", async () => {
  const userId = mongoose.Types.ObjectId().toHexString();

  const ticket = Ticket.build({ title: "concert", price: 20, userId });
  await ticket.save();

  const tickets = await Ticket.find({});

  expect(tickets.length).toEqual(1);

  const { body } = await request(app)
    .get(`/api/tickets/${ticket.id}`)
    .send()
    .expect(200);

  expect(body.title).toEqual("concert");
  expect(body.price).toEqual(20);
});
