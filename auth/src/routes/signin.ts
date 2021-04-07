import express from "express";

const router = express.Router();

router.post("/api/users/signin", (req, res) => {
  res.send("successfully signed out");
});

export { router as signinRouter };
