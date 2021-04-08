import express, { Response, Request } from "express";
import { body, validationResult } from "express-validator";

import { User } from "../models/User";
import { RequestValidationError } from "../errors/requestValidationError";
import { BadRequestError } from "../errors/badRequestError";

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
  async (req: Request, res: Response) => {
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      throw new RequestValidationError(errors.array());
    }

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

    res.status(201).send(newUser);
  }
);

export { router as signupRouter };
