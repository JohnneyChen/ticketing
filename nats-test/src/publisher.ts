import nats from "node-nats-streaming";

import { TicketCreatedPublisher } from "./events/ticketCreatedPublisher";

console.clear();

const stan = nats.connect("ticketing", "abc", {
  url: "http://localhost:4222",
});

stan.on("connect", async () => {
  console.log("publisher connected to nats");

  const publisher = new TicketCreatedPublisher(stan);

  try {
    await publisher.publish({
      id: "c3p0",
      title: "Concert",
      price: 150,
    });
  } catch (err) {
    console.error(err);
  }
});
