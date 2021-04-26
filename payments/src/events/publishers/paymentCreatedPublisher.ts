import {
  Publisher,
  Subjects,
  PaymentCreatedEvent,
} from "@johnneychentix/common";

export class PaymentCreatedPublisher extends Publisher<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated;
}
