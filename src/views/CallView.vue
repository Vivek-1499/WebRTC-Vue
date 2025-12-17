<script setup>
import { onMounted, ref } from 'vue';

const user1 = ref(null)
const user2 = ref(null)

const offerSDP = ref('');
const answerSDP = ref('');

const Mic = ref(false)
const Camera = ref(false)
const ScreenShare = ref(false)

let localStream
let remoteStream
let onScreenMedia
let peerConnection

const servers = {
  iceServers: [{
    urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302']
  }]
}

onMounted(async () => {
  try {
    localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true })

    localStream.getAudioTracks()[0].enabled = false
    localStream.getVideoTracks()[0].enabled = false

    Mic.value = false
    Camera.value = false

    if (user1.value) {
      user1.value.srcObject = localStream
    }

  } catch (error) {
    console.log(error)
  }
})

const init = async () => {
  peerConnection = new RTCPeerConnection(servers)

  //able to send to other user
  localStream.getTracks().forEach((track) => {
    peerConnection.addTrack(track, localStream)
  })
  remoteStream = new MediaStream() //container for incomming stream (so we know what the other user is sending)
  peerConnection.ontrack = async (e) => { //get the track and add to remotestream
    e.streams[0].getTracks().forEach((track) => {
      remoteStream.addTrack(track)
    })
    if (user2.value) user2.value.srcObject = remoteStream;
  }
  peerConnection.onconnectionstatechange = () => {
    console.log("Connection state:", peerConnection.connectionState)
  }
}
const stopScreenShare = () => {
  if (!onScreenMedia) return;

  onScreenMedia.stop();
  ScreenShare.value = false;

  if (user1.value) {
    user1.value.srcObject = localStream;
  }

  if (peerConnection) {
    const videoSender = peerConnection.getSenders().find(s => s.track.kind === 'video');
    const cameraTrack = localStream.getVideoTracks()[0];

    if (videoSender && cameraTrack) {
      videoSender.replaceTrack(cameraTrack);
    }
  }
  onScreenMedia = null;
}

const toggleScreenShare = async () => {
  if (ScreenShare.value) {
    stopScreenShare();
    return;
  }

  try {
    const screenStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
    const screenTrack = screenStream.getVideoTracks()[0];
    onScreenMedia = screenTrack;

    screenTrack.onended = () => {
      if (ScreenShare.value) stopScreenShare();
    }

    if (user1.value) {
      user1.value.srcObject = screenStream;
    }

    if (peerConnection) {
      const videoSender = peerConnection.getSenders().find(s => s.track.kind === "video");
      if (videoSender) {
        videoSender.replaceTrack(screenTrack);
      }
    }
    ScreenShare.value = true;
  } catch (error) {
    console.error(error);
  }
}

const createOffer = async () => {
  await init()

  let offer = await peerConnection.createOffer()
  await peerConnection.setLocalDescription(offer)

  offerSDP.value = "Gathering network candidates... Please wait..."
  peerConnection.onicecandidate = async (e) => {
    if (!e.candidate) {
      offerSDP.value = JSON.stringify(peerConnection.localDescription)
    }
  }
}

const createAns = async () => {

  if (!offerSDP.value) return alert("Paste the offer first")

  await init()
  const offer = JSON.parse(offerSDP.value)
  await peerConnection.setRemoteDescription(offer)

  const answer = await peerConnection.createAnswer()
  await peerConnection.setLocalDescription(answer)

  answerSDP.value = "Gathering network candidates... Please wait..."

  peerConnection.onicecandidate = async (e) => {
    if (!e.candidate) {
      answerSDP.value = JSON.stringify(peerConnection.localDescription)
    }
  }
}

const addAnswer = async () => {
  if (!answerSDP.value) {
    alert("Paste the answer SDP first")
    return
  }

  const ans = JSON.parse(answerSDP.value)

  if (!peerConnection.currentRemoteDescription) {
    await peerConnection.setRemoteDescription(ans)
  }
}

const copyToClipboard = async (text) => {
  if (!text || text.includes("Gathering")) return alert("Wait sometime")
  try {
    await navigator.clipboard.writeText(text)
  } catch (err) {
    alert("Failed to copy.")
  }
}

const toggleCamera = () => {
  if (!localStream) return
  const videoTrack = localStream.getVideoTracks()[0];
  if (!videoTrack) return;

  videoTrack.enabled = !videoTrack.enabled
  Camera.value = !Camera.value
}

const toggleMic = () => {
  if (!localStream) return;
  const audioTrack = localStream.getAudioTracks()[0];
  if (!audioTrack) return;

  audioTrack.enabled = !audioTrack.enabled;
  Mic.value = audioTrack.enabled;
}
</script>

<template>
  <div class="video-container">
    <div class="video-wrapper">
      <div class="video-label">You</div>
      <video class="video-player" ref="user1" autoplay playsinline muted></video>

      <div class="controls">
        <button @click="toggleMic" :class="{ 'btn-active': Mic, 'btn-off': !Mic }">
          <i :class="Mic ? 'fa-solid fa-microphone' : 'fa-solid fa-microphone-slash'"></i>
        </button>

        <button @click="toggleCamera" :class="{ 'btn-active': Camera, 'btn-off': !Camera }">
          <i :class="Camera ? 'fa-solid fa-video' : 'fa-solid fa-video-slash'"></i>
        </button>

        <button @click="toggleScreenShare" :class="{ 'btn-active': ScreenShare, 'btn-off': !ScreenShare }">
          <i class="fa-solid fa-display"></i>
        </button>
      </div>

    </div>

    <div class="video-wrapper">
      <div class="video-label">Remote</div>
      <video class="video-player" ref="user2" autoplay playsinline></video>
    </div>
  </div>

  <div class="sdp offer">
    <div class="button">
      <button @click="createOffer">Create Offer</button>
      <button class="copy-btn" @click="copyToClipboard(offerSDP)">Copy Offer</button>
    </div>
    <label for="offer"> SDP offer</label>
    <textarea name="offer" id="offer" v-model="offerSDP"
      placeholder="Offer Code will appear here or paste offer if recvieving"></textarea>
  </div>

  <div class="sdp answer">
    <div class="button">
      <button @click="createAns">Create Answer</button>
      <button class="copy-btn" @click="copyToClipboard(answerSDP)">Copy Answer</button>
    </div>
    <label for="answer"> SDP answer</label>
    <textarea name="answer" id="answer" v-model='answerSDP'
      placeholder="Answer code will appear here or paste if calling"></textarea>
  </div>

  <button id="add-answer" @click="addAnswer">Call</button>
</template>

<style scoped>
.video-container {
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
  margin-top: 1rem;
}

.video-wrapper {
  position: relative;
  width: 100%;
  max-width: 700px;
}

video {
  width: 100%;
  height: 400px;
  background-color: black;
  border-radius: 0.5rem;
  object-fit: cover;
}

.video-label {
  position: absolute;
  top: 10px;
  left: 10px;
  color: white;
  background-color: #1a1a1a60;
  padding: 0.2rem 0.5rem;
  border-radius: 0.1rem;
  font-size: small;
  z-index: 10;
}

.controls {
  position: absolute;
  bottom: 20px;
  display: flex;
  left: 50%;
  transform: translateX(-50%);
  gap: 0.5rem;
  z-index: 10;
  border-radius: 20px;
}

.controls button {
  border-radius: 50%;
  height: 3rem;
  width: 3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border: none;
  transition: all 0.5s;
}

.btn-active {
  background-color: #cdcdcd;
  color: #333;
}

.btn-off {
  background-color: #ff4757;
  color: white;
}

.controls button:hover {
  color: black
}

.sdp {
  width: 80%;
  margin: 1.5rem auto;
  display: flex;
  flex-direction: column;
}

.button {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-bottom: 0.5rem;
}

button {
  padding: 0.6rem 0.8rem;
  border-radius: 0.5rem;
  cursor: pointer;
  border: 1px solid #ccc;
  background-color: #eee;
  font-weight: 600;
  transition: background-color 0.2s;
}

button:hover {
  background-color: #ddd;
}

.copy-btn {
  background-color: #555d95;
  color: white;
  border: none;
}

.copy-btn:hover {
  background-color: #424874;
}

#add-answer {
  display: block;
  margin: 2rem auto;
  width: 200px;
  padding: 0.7rem;
  border-radius: 0.5rem;
  font-weight: 600;
  cursor: pointer;
}

textarea {
  width: 100%;
  height: 60px;
  padding: 0.5rem;
  border-radius: 0.5rem;
  border: 1px solid #bbb;
  resize: vertical;
  background: #fafafa;
  font-family: monospace;
}

@media (max-width: 768px) {
  .video {
    grid-template-columns: 1fr;
    height: auto;
  }

  video {
    height: 250px;
  }

  button {
    flex: 1;
  }

  .controls button {
    height: 2.3rem;
    width: 2.3rem;
  }
}
</style>
