import { Publisher, Subjects, OrderCreatedEvent } from "@johnneychentix/common";

export class OrderCreatedPublisher extends Publisher<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
}
