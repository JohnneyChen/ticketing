import { Publisher, Subjects, TicketEditedEvent } from "@johnneychentix/common";

export class TicketEditedPublisher extends Publisher<TicketEditedEvent> {
  readonly subject = Subjects.TicketEdited;
}
