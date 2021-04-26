import Queue from "bull";

import { natsWrapper } from "../NatsWrapper";
import { ExpirationCompletePublisher } from "../events/publishers/expirationCompletePublisher";

interface Payload {
  orderId: string;
}

const expirationQueue = new Queue<Payload>("order:expiration", {
  redis: {
    host: process.env.REDIS_HOST,
  },
});

expirationQueue.process(async (job) => {
  await new ExpirationCompletePublisher(natsWrapper.client).publish({
    orderId: job.data.orderId,
  });
});

export { expirationQueue };
