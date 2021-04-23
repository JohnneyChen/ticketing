import {
  Publisher,
  Subjects,
  OrderCancelledEvent,
} from "@johnneychentix/common";

export class OrderCancelledPublisher extends Publisher<OrderCancelledEvent> {
  readonly subject = Subjects.OrderCancelled;
}
