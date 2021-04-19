import { Stan, Message } from "node-nats-streaming";

import { Subjects } from "./Subjects";

interface Event {
  subject: Subjects;
  data: any;
}

export abstract class Publisher<T extends Event> {
  abstract subject: T["subject"];

  constructor(private client: Stan) {}

  publish(data: T["data"]): Promise<void> {
    return new Promise((resolve, reject) => {
      const jsonData = JSON.stringify(data);

      this.client.publish(this.subject, jsonData, (err) => {
        if (err) {
          reject(err);
        }

        console.log(`Published ${this.subject} event`);
        resolve();
      });
    });
  }
}
