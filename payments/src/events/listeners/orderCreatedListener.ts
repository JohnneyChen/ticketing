import { Subjects, Listener, OrderCreatedEvent } from "@johnneychentix/common";
import { Message } from "node-nats-streaming";

import { Order } from "../../models/Order";
import { queueGroupName } from "./queueGroupName";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
  readonly subject = Subjects.OrderCreated;
  queueGroupName = queueGroupName;
  async onMessage(data: OrderCreatedEvent["data"], msg: Message) {
    const order = Order.build({
      id: data.id,
      userId: data.userId,
      status: data.status,
      price: data.ticket.price,
      version: data.version,
    });

    await order.save();

    msg.ack();
  }
}
