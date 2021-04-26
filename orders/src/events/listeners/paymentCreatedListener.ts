import {
  Listener,
  Subjects,
  PaymentCreatedEvent,
  OrderStatus,
} from "@johnneychentix/common";
import { Message } from "node-nats-streaming";

import { queueGroupName } from "./queueGroupName";
import { Order } from "../../models/Order";
import { Error } from "mongoose";

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
  readonly subject = Subjects.PaymentCreated;
  queueGroupName = queueGroupName;
  async onMessage(data: PaymentCreatedEvent["data"], msg: Message) {
    const order = await Order.findById(data.orderId);

    if (!order) {
      throw new Error("order not found");
    }

    order.set({ status: OrderStatus.Complete });

    await order.save();

    msg.ack();
  }
}
