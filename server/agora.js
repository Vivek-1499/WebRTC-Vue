import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import pkg from "agora-token";

const {RtcRole, RtcTokenBuilder} = pkg

dotenv.config();

const app = express();
const PORT = 3000;

const TOKEN_EXPIRATION_TIME = 3600


app.use(cors({
  origin: [
    "https://webrtc-vue-ecru.vercel.app/"
  ],
  methods: ["GET", "POST"],
  credentials: true
}));

app.get("/getToken", (req, res) => {
  console.log("Incoming Request Query:", req.query);
  const { channel, uid } = req.query;

  if (!channel || uid === undefined || uid === null || uid === '') {
    console.error("Validation Failed. Missing channel or uid.");
    return res.status(400).json({ error: "Missing channel or uid" });
  }
  console.log(`Validated! Generating tokens for Channel: ${channel}, UID: ${uid}`);
  const currentTimestamp = Math.floor(Date.now() / 1000);
  const privilegeExpiredTs = currentTimestamp + TOKEN_EXPIRATION_TIME;

  try {
    const token = RtcTokenBuilder.buildTokenWithUid(
      process.env.AGORA_APP_ID,
      process.env.AGORA_APP_CERTIFICATE,
      channel,
      parseInt(uid),
      RtcRole.PUBLISHER,
      privilegeExpiredTs
    )
  
    // const rtmToken = RtmTokenBuilder.buildToken(
    //   process.env.AGORA_APP_ID,
    //   process.env.AGORA_APP_CERTIFICATE,
    //   String(uid),
    //   privilegeExpiredTs
    // )
    console.log("Tokens generated successfully.");
    res.json({token})
    
  } catch (error) {
    console.error("Token Generation Error:", error);
    res.status(500).json({ error: "Internal Server Error during token generation" });
  }

});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});

