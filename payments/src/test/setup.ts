import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";
import jwt from "jsonwebtoken";

declare global {
  namespace NodeJS {
    interface Global {
      signin(): string[];
    }
  }
}

process.env.STRIPE_KEY =
  "sk_test_51ICS0mHRIHw8xwrCbg4xIa7b4rRzp9A0N3JFa7fgPvPiHKs8VapoBQXGYiXJFSRS0oINY5wNdLmIdKdaLkpiOZ8T00FLzDySMm";
let mongo: any;

jest.mock("../NatsWrapper");

beforeAll(async () => {
  process.env.JWT_KEY = "asdf";
  process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

  mongo = new MongoMemoryServer();
  const mongoUri = await mongo.getUri();

  await mongoose.connect(mongoUri, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
});

beforeEach(async () => {
  jest.clearAllMocks();
  const collections = await mongoose.connection.db.collections();

  collections.forEach(async (collection) => {
    await collection.deleteMany({});
  });
});

afterAll(async () => {
  await mongo.stop();
  await mongoose.connection.close();
});

global.signin = () => {
  const user = {
    email: "test@test.com",
    id: "6076381c4e3b30c0fad4ce39",
  };

  const webtoken = jwt.sign(user, process.env.JWT_KEY!);

  const session = { jwt: webtoken };

  const sessionJSON = JSON.stringify(session);

  const base64 = Buffer.from(sessionJSON).toString("base64");

  return [`express:sess=${base64}`];
};
