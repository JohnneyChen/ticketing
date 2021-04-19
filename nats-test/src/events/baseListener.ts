import { Stan, Message } from "node-nats-streaming";

import { Subjects } from "./Subjects";

interface Event {
  subject: Subjects;
  data: any;
}

export abstract class Listener<T extends Event> {
  abstract subject: T["subject"];
  abstract queryGroupName: string;
  abstract onMessage(parseData: T["data"], msg: Message): void;

  constructor(private client: Stan) {}

  protected ackWait = 5 * 1000;

  subscriptionOptions() {
    return this.client
      .subscriptionOptions()
      .setDeliverAllAvailable()
      .setManualAckMode(true)
      .setAckWait(this.ackWait)
      .setDurableName(this.queryGroupName);
  }

  listen() {
    const subscription = this.client.subscribe(
      this.subject,
      this.queryGroupName,
      this.subscriptionOptions()
    );

    subscription.on("message", (msg: Message) => {
      console.log(
        `Messaged recieved: ${this.subject} / ${this.queryGroupName}`
      );

      const parsedData = this.parseMessage(msg);
      this.onMessage(parsedData, msg);
    });
  }

  parseMessage(msg: Message): T["data"] {
    const data = msg.getData();

    return typeof data === "string"
      ? JSON.parse(data)
      : JSON.parse(data.toString("utf8"));
  }
}
