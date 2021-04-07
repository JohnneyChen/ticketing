import express from "express";

const router = express.Router();

router.get("/api/users/currentuser", (req, res) => {
  res.send("you got the current user!");
});

export { router as currentUserRouter };
