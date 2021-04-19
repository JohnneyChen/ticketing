import { TicketCreatedEvent } from "./ticketCreatedEvent";
import { Publisher } from "./basePublisher";
import { Subjects } from "./Subjects";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;
}
