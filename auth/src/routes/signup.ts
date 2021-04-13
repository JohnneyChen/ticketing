import express, { Response, Request } from "express";
import { body } from "express-validator";
import jwt from "jsonwebtoken";

import { User } from "../models/User";
import { validateRequest } from "@johnneychentix/common";
import { BadRequestError } from "@johnneychentix/common";

const router = express.Router();

router.post(
  "/api/users/signup",
  [
    body("email").isEmail().withMessage("Please enter a valid email"),
    body("password")
      .trim()
      .isLength({ min: 4, max: 20 })
      .withMessage("Please enter a password between 4 and 20 characters"),
  ],
  validateRequest,
  async (req: Request, res: Response) => {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      throw new BadRequestError("User with this email already exists");
    }

    const newUser = User.build({
      email,
      password,
    });
    await newUser.save();

    const userJwt = jwt.sign(
      {
        id: newUser.id,
        email: newUser.email,
      },
      process.env.JWT_KEY!
    );

    req.session = {
      jwt: userJwt,
    };

    res.status(201).send(newUser);
  }
);

export { router as signupRouter };
