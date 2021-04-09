import request from "supertest";
import { app } from "../../app";

it("sends user information if token is valid", async () => {
  const jwt = await global.signin();

  const res = await request(app)
    .get("/api/users/currentuser")
    .send()
    .set("Cookie", jwt)
    .expect(200);

  expect(res.body.currentUser.email).toEqual("test@test.com");
});

it("sends empty object with invalid token", async () => {
  const res = await request(app)
    .get("/api/users/currentuser")
    .send()
    .set("Cookie", "invalidtoken")
    .expect(200);

  expect(res.body.currentUser).toEqual(null);

  const noCookieRes = await request(app)
    .get("/api/users/currentuser")
    .send()
    .expect(200);

  expect(noCookieRes.body.currentUser).toEqual(null);
});
