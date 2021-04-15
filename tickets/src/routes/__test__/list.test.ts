import request from "supertest";
import { app } from "../../app";
import mongoose from "mongoose";
import { Ticket } from "../../models/Ticket";

it("route exists", async () => {
  const response = await request(app).get("/api/tickets").send();

  expect(response.status).not.toEqual(404);
});

it("200 and returns empty array when no records present", async () => {
  const response = await request(app).get("/api/tickets").send();

  expect(response.body).toBeInstanceOf(Array);
  expect(response.body.length).toEqual(0);
});

it("200 and returns tickets info on valid request", async () => {
  const userId = mongoose.Types.ObjectId().toHexString();

  const ticket1 = Ticket.build({ title: "concert", price: 50, userId });
  await ticket1.save();

  const response = await request(app).get("/api/tickets").send().expect(200);

  expect(response.body.length).toEqual(1);
  expect(response.body[0].title).toEqual("concert");
  expect(response.body[0].price).toEqual(50);

  const ticket2 = Ticket.build({ title: "football game", price: 120, userId });
  await ticket2.save();

  const response2 = await request(app).get("/api/tickets").send().expect(200);

  expect(response2.body.length).toEqual(2);
  expect(response2.body[0].title).toEqual("concert");
  expect(response2.body[0].price).toEqual(50);
  expect(response2.body[1].title).toEqual("football game");
  expect(response2.body[1].price).toEqual(120);
});
