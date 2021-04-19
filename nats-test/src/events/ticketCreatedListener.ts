import { Message } from "node-nats-streaming";

import { TicketCreatedEvent } from "./ticketCreatedEvent";
import { Listener } from "./baseListener";
import { Subjects } from "./Subjects";

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;
  queryGroupName = "query-group-name";
  onMessage(data: TicketCreatedEvent["data"], msg: Message) {
    console.log("Event data", data);

    console.log(data.id);
    console.log(data.title);
    console.log(data.price);

    msg.ack();
  }
}
