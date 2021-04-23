import { Listener, Subjects, OrderCreatedEvent } from "@johnneychentix/common";
import { Error } from "mongoose";
import { Message } from "node-nats-streaming";

import { Ticket } from "../../models/Ticket";
import { TicketEditedPublisher } from "../publishers/ticketEditedPublisher";
import { queueGroupName } from "./queueGroupName";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
  queueGroupName = queueGroupName;
  async onMessage(data: OrderCreatedEvent["data"], msg: Message) {
    const { id, ticket } = data;

    const ticketToUpdate = await Ticket.findById(ticket.id);

    if (!ticketToUpdate) {
      throw new Error("Ticket not found");
    }

    ticketToUpdate.set({ orderId: id });
    await ticketToUpdate.save();

    await new TicketEditedPublisher(this.client).publish({
      id: ticketToUpdate.id,
      version: ticketToUpdate.version,
      title: ticketToUpdate.title,
      price: ticketToUpdate.price,
      userId: ticketToUpdate.userId,
      orderId: ticketToUpdate.orderId,
    });

    msg.ack();
  }
}
