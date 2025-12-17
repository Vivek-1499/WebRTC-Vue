import express from "express";
import { AccessToken } from "livekit-server-sdk";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(cors());

app.get("/getToken", (req, res) => {
  const { room, name } = req.query;

  if (!room || !name) {
    return res.status(400).json({ error: "Missing room or name" });
  }

  const at = new AccessToken(
    process.env.LIVEKIT_API_KEY,
    process.env.LIVEKIT_API_SECRET,
    { identity: name }
  );

  at.addGrant({roomJoin: true, room});

  const token = at.toJwt();
  res.json({token})
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
