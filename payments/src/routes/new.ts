import express, { Request, Response } from "express";
import { body } from "express-validator";
import {
  BadRequestError,
  NotAuthorizedError,
  NotFoundError,
  requireAuth,
  validateRequest,
  OrderStatus,
} from "@johnneychentix/common";

import { stripe } from "../stripe";
import { Order } from "../models/Order";
import { Payment } from "../models/Payment";
import { natsWrapper } from "../NatsWrapper";
import { PaymentCreatedPublisher } from "../events/publishers/paymentCreatedPublisher";

const router = express.Router();

router.post(
  "/api/payments",
  requireAuth,
  [
    body("token").notEmpty().withMessage("Valid token required"),
    body("orderId").notEmpty().withMessage("Valid orderId required"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { token, orderId } = req.body;

    const order = await Order.findById(orderId);

    if (!order) {
      throw new NotFoundError();
    }

    if (order.userId !== req.currentUser!.id) {
      throw new NotAuthorizedError();
    }

    if (order.status === OrderStatus.Cancelled) {
      throw new BadRequestError("Cannot pay for cancelled order");
    }

    const charge = await stripe.charges.create({
      amount: order.price * 100,
      currency: "cad",
      source: token,
    });

    const payment = Payment.build({
      orderId,
      chargeId: charge.id,
    });

    await payment.save();

    await new PaymentCreatedPublisher(natsWrapper.client).publish({
      id: payment.id,
      chargeId: payment.chargeId,
      orderId: payment.orderId,
    });

    res.status(201).send({ id: payment.id });
  }
);

export { router as newPaymentRouter };
