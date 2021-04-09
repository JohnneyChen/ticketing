import request from "supertest";
import { app } from "../../app";

it("201 after valid email and password signup", async () => {
  const res = await request(app).post("/api/users/signup").send({
    email: "test@test.com",
    password: "password",
  });

  expect(res.body.email).toEqual("test@test.com");
});

it("400 after invalid email signup", async () => {
  const res = await request(app)
    .post("/api/users/signup")
    .send({
      email: "bademail",
      password: "password",
    })
    .expect(400);

  expect(res.body.errors[0].message).toEqual("Please enter a valid email");
  expect(res.body.errors[0].field).toEqual("email");
});

it("400 after invalid password signup", async () => {
  const res = await request(app)
    .post("/api/users/signup")
    .send({
      email: "test@test.com",
      password: "p",
    })
    .expect(400);

  expect(res.body.errors[0].message).toEqual(
    "Please enter a password between 4 and 20 characters"
  );
  expect(res.body.errors[0].field).toEqual("password");
});

it("400 after missing password or email signup", async () => {
  const passwordRes = await request(app)
    .post("/api/users/signup")
    .send({
      email: "test@test.com",
    })
    .expect(400);

  expect(passwordRes.body.errors[0].message).toEqual(
    "Please enter a password between 4 and 20 characters"
  );
  expect(passwordRes.body.errors[0].field).toEqual("password");

  const emailRes = await request(app)
    .post("/api/users/signup")
    .send({
      password: "password",
    })
    .expect(400);

  expect(emailRes.body.errors[0].message).toEqual("Please enter a valid email");
  expect(emailRes.body.errors[0].field).toEqual("email");
});

it("400 after duplicate email signup", async () => {
  await global.signin();

  const res = await request(app)
    .post("/api/users/signup")
    .send({
      email: "test@test.com",
      password: "anotherpassword",
    })
    .expect(400);

  expect(res.body.errors[0].message).toEqual(
    "User with this email already exists"
  );
});

it("sets token after successful signup", async () => {
  const token = await global.signin();

  expect(token).toBeDefined();
});
