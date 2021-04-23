import { Subjects, Listener, TicketEditedEvent } from "@johnneychentix/common";
import { Message } from "node-nats-streaming";

import { Ticket } from "../../models/Ticket";
import { queueGroupName } from "./queueGroupName";

export class TicketEditedListener extends Listener<TicketEditedEvent> {
  readonly subject = Subjects.TicketEdited;
  queueGroupName = queueGroupName;
  onMessage = async (parseData: TicketEditedEvent["data"], msg: Message) => {
    const { title, price } = parseData;

    const ticket = await Ticket.findByEvent(parseData);

    if (!ticket) {
      throw new Error("Ticket not found");
    }

    ticket.set({ title, price });
    await ticket.save();

    msg.ack();
  };
}
