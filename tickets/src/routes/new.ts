import express, { Request, Response } from "express";
import { body } from "express-validator";
import { requireAuth, validateRequest } from "@johnneychentix/common";

import { Ticket } from "../models/Ticket";

const router = express.Router();

router.post(
  "/api/tickets",
  requireAuth,
  [
    body("title").notEmpty().withMessage("A valid title is required"),
    body("price")
      .notEmpty()
      .withMessage("A valid price (greater than 0) is required"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { title, price } = req.body;
    const userId = req.currentUser!.id;

    const ticket = Ticket.build({ title, price, userId });
    await ticket.save();

    res.status(201).send(ticket);
  }
);

export { router as newRouter };
