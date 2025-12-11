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
  } catch (error) {
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
}
// onMounted(() => {
//   init()
// })

const generateIceCandidates = async () => {
  peerConnection.onicecandidate = async (e) => {
    if (e.candidate) {
      offerSDP.value = JSON.stringify(peerConnection.localDescription)
    }
  }
}
const createOffer = async () => {
  await init()
  await generateIceCandidates()

  let offer = await peerConnection.createOffer()
  await peerConnection.setLocalDescription(offer)
  offerSDP.value = JSON.stringify(offer)

}

const createAns = async () => {
  await init()

  if (!offerSDP.value) return alert("Paste the offer")
  
  await generateIceCandidates()
  const offer = JSON.parse(offerSDP.value)
  await peerConnection.setRemoteDescription(offer)

  const answer = await peerConnection.createAnswer()
  await peerConnection.setLocalDescription(answer)


  answerSDP.value = JSON.stringify(peerConnection.localDescription)

}

const addAnswer =async()=>{
  if(!answerSDP){
    alert("paste the anserSDP")
    return
  } 

  const ans = JSON.parse(answerSDP.value)

  if(!peerConnection.currentRemoteDescription){
    await peerConnection.setRemoteDescription(ans)
  }
}
</script>

<template>
  <div class="video">
    <video class="video-player" ref="user1" autoplay playsinline></video>
    <video class="video-player" ref="user2" autoplay playsinline></video>
  </div>

  <div class="sdp offer">
    <button @click="createOffer">Create Offer</button>
    <label for="offer"> SDP offer</label>
    <textarea name="offer" id="offer" v-model="offerSDP"
      placeholder="Offer Code will appear here or paste offer if recvieving"></textarea>
  </div>

  <div class="sdp answer">
    <button @click="createAns">Create Answer</button>
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
  column-gap: 1rem;
  width: 90%;
  margin: auto;
  margin-top: 2rem;


}

video {
  width: 100%;
  border: 2px solid black;
  background-color: rgb(68, 68, 68);
  height: 300px;
}

.sdp {
  display: flex;
  flex-direction: column;
  margin: auto;
  width: 80%;
  margin-top: 1rem;
}

button {
  display: flex;
  margin: auto;
  width: 20rem;
  padding: 0.5rem;
  justify-content: center;
  border-radius: 0.5rem;

}
</style>