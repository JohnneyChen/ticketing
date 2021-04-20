import {
  Publisher,
  Subjects,
  TicketCreatedEvent,
} from "@johnneychentix/common";

export class TicketCreatedPublisher extends Publisher<TicketCreatedEvent> {
  readonly subject = Subjects.TicketCreated;
}
