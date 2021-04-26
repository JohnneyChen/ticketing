import {
  Publisher,
  Subjects,
  ExpirationCompleteEvent,
} from "@johnneychentix/common";

export class ExpirationCompletePublisher extends Publisher<ExpirationCompleteEvent> {
  readonly subject = Subjects.ExpirationComplete;
}
