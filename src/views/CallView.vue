<script setup>
import { ref } from 'vue';

const user1 = ref(null)
const user2 = ref(null)

const offerSDP = ref('');
const answerSDP = ref('');

let localStream
let remoteStream
let peerConnection

const servers = {
  iceServers: [{
    urls: ['stun:stun1.l.google.com:19302', 'stun:stun2.l.google.com:19302']
  }]
}

const init = async () => {
  peerConnection = new RTCPeerConnection(servers)

  try {
    localStream = await navigator.mediaDevices.getUserMedia({ audio: true, video: true })
  } catch (err) {
    console.error("Media permission denied: ", err)
    alert("Allow media permission, Refresh")
  }

  if (user1.value) {
    user1.value.srcObject = localStream
  }

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
  await init()

  if (!offerSDP.value) return alert("Paste the offer first")

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
  if (!text || text.includes("Gathering")) return alert("Wait for code to generate")
  try {
    await navigator.clipboard.writeText(text)
  } catch (err) {
    alert("Failed to copy.")
  }
}
</script>

<template>
  <div class="video">
    <video class="video-player" ref="user1" autoplay playsinline></video>
    <video class="video-player" ref="user2" autoplay playsinline></video>
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

  <button id="add-answer" @click="addAnswer">Add answer</button>
</template>

<style scoped>
.video {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
  width: 90%;
  margin: 2rem auto;
}

video {
  width: 100%;
  height: 300px;
  border: 2px solid #333;
  background-color: #444;
  border-radius: 6px;
  object-fit: cover;
}

/* SDP container styling */
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
}
</style>
