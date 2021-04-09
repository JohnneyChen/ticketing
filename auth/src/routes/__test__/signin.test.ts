import request from "supertest";
import { app } from "../../app";

it("200 after successful signin", async () => {
  await global.signin();

  await request(app)
    .post("/api/users/signin")
    .send(global.validCredentials)
    .expect(200);
});

it("400 after missing password or email signin", async () => {
  const passwordRes = await request(app)
    .post("/api/users/signin")
    .send({
      email: "test@test.com",
    })
    .expect(400);

  expect(passwordRes.body.errors[0].message).toEqual(
    "Valid password is required"
  );
  expect(passwordRes.body.errors[0].field).toEqual("password");

  const emailRes = await request(app)
    .post("/api/users/signin")
    .send({
      password: "password",
    })
    .expect(400);

  expect(emailRes.body.errors[0].message).toEqual("Please enter a valid email");
  expect(emailRes.body.errors[0].field).toEqual("email");
});

it("400 after invalid email or password signin", async () => {
  await global.signin();

  const emailRes = await request(app)
    .post("/api/users/signin")
    .send({
      email: "wrongemail@test.com",
      password: "password",
    })
    .expect(400);

  expect(emailRes.body.errors[0].message).toEqual("Invalid login credentials");

  const passwordRes = await request(app)
    .post("/api/users/signin")
    .send({
      email: "test@test.com",
      password: "wrongpassword",
    })
    .expect(400);

  expect(passwordRes.body.errors[0].message).toEqual(
    "Invalid login credentials"
  );
});

it("sets token after successful signin", async () => {
  await global.signin();

  const res = await request(app)
    .post("/api/users/signin")
    .send(global.validCredentials)
    .expect(200);

  expect(res.get("Set-Cookie")).toBeDefined();
});
