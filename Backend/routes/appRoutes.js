import express from "express";
import { openSpotify } from "../utils/openApp.js";

const router = express.Router();

router.get("/open-spotify", (req, res) => {
  openSpotify();
  res.json({ success: true, message: "Spotify opened!" });
});

export default router;
