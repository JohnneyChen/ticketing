import { Subjects, Listener, TicketCreatedEvent } from "@johnneychentix/common";
import { Message } from "node-nats-streaming";

import { Ticket } from "../../models/Ticket";
import { queueGroupName } from "./queueGroupName";

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;
  queueGroupName = queueGroupName;

  onMessage = async (parseData: TicketCreatedEvent["data"], msg: Message) => {
    const { id, version, title, price, userId } = parseData;

    const ticket = Ticket.build({
      _id: id,
      title,
      price,
    });

    await ticket.save();

    msg.ack();
  };
}
