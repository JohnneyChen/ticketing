import express, { Request, Response } from "express";
import { body } from "express-validator";
import {
  requireAuth,
  currentUser,
  validateRequest,
  NotAuthorizedError,
  NotFoundError,
  BadRequestError,
} from "@johnneychentix/common";

import { Ticket } from "../models/Ticket";
import { TicketEditedPublisher } from "../events/publishers/ticketEditedPublisher";
import { natsWrapper } from "../NatsWrapper";

const router = express.Router();

router.put(
  "/api/tickets/:id",
  requireAuth,
  currentUser,
  [
    body("title").notEmpty().withMessage("A valid title is required"),
    body("price")
      .isFloat({ gt: 0 })
      .withMessage("A valid price (greater than 0) is required"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { id } = req.params;
    const { title, price } = req.body;
    const currentUserId = req.currentUser!.id;

    const ticket = await Ticket.findById(id);

    if (!ticket) {
      throw new NotFoundError();
    }

    if (ticket.orderId) {
      throw new BadRequestError("Cannot edit reserved ticket");
    }

    if (ticket.userId !== currentUserId) {
      throw new NotAuthorizedError();
    }

    ticket.set({ title, price });

    await ticket.save();
    await new TicketEditedPublisher(natsWrapper.client).publish({
      id: ticket.id,
      version: ticket.version,
      title: ticket.title,
      price: ticket.price,
      userId: ticket.userId,
    });

    res.status(200).send(ticket);
  }
);

export { router as editTicketRouter };
