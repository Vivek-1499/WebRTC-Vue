<script setup>
import { computed, onUnmounted, ref, onMounted, nextTick } from 'vue';
import AgoraRTC from 'agora-rtc-sdk-ng';
import axios from 'axios';
import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();

const isJoined = ref(false);
const isJoining = ref(false);

const APP_ID = import.meta.env.VITE_AGORA_APP_ID;
const backend = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000/getToken';
const roomId = ref("");
const channelName = computed(() => route.params.roomId || roomId.value);

const uid = ref(Math.floor(Math.random() * 10000));
const Mic = ref(false);
const Camera = ref(false);
const ScreenShare = ref(false);
let client = null;

let localAudioTrack = null;
let localVideoTrack = null;
let localScreenTrack = null;

const remoteUsers = ref({});

const isRecording = ref(false);
let mediaRecorder = null;
let recordedBlobs = [];

const initializeClient = () => {
  client = AgoraRTC.createClient({ mode: "rtc", codec: "vp8" });
  client.on('user-published', async (user, mediaType) => {
    await client.subscribe(user, mediaType);
    if (!remoteUsers.value[user.uid]) {
      remoteUsers.value = { ...remoteUsers.value, [user.uid]: user };
    }
    if (mediaType === "video") {
      await nextTick();

      user.videoTrack.play(`remote-user-${user.uid}`);
    } else if (mediaType === 'audio') {
      user.audioTrack.play();
    }
  });

  client.on('user-left', (user) => {
    const { [user.uid]: removed, ...rest } = remoteUsers.value;
    remoteUsers.value = rest;
  });
};

const toggleCamera = async () => {
  if (!localVideoTrack) return;
  if (Camera.value) {
    await localVideoTrack.setEnabled(false);
    Camera.value = false;
  } else {
    await localVideoTrack.setEnabled(true);
    localVideoTrack.play("local-player");
    Camera.value = true;
  }
};

const toggleMic = async () => {
  if (!localAudioTrack) return;
  await localAudioTrack.setEnabled(!Mic.value);
  Mic.value = !Mic.value;
};

const toggleScreenShare = async () => {
  if (!isJoined.value) return;

  if (!ScreenShare.value) {
    try {
      localScreenTrack = await AgoraRTC.createScreenVideoTrack();
      if (localVideoTrack) await client.unpublish(localVideoTrack);
      await client.publish(localScreenTrack);
      localScreenTrack.play('local-player');

      localScreenTrack.on('track-ended', () => {
        toggleScreenShare();
      });

      ScreenShare.value = true;
      Camera.value = false;
    } catch (error) {
      console.log(error);
    }
  } else {
    if (localScreenTrack) {
      await client.unpublish(localScreenTrack);
      localScreenTrack.close();
      localScreenTrack = null;

      if (localVideoTrack && Camera.value) {
        await client.publish(localVideoTrack);
        localVideoTrack.play('local-player');
      }
      Camera.value = true;
    }
    ScreenShare.value = false;
  }
};

const joinChannel = async () => {
  isJoining.value = true;

  if (!roomId.value && !route.params.roomId) {
    roomId.value = `room-${Math.random().toString(36).substring(2, 9)}`;
  }

  if (!route.params.roomId) {
    await router.push({ name: 'room', params: { roomId: channelName.value } });
  }

  if (!client) initializeClient();

  try {
    const { data } = await axios.get(backend, {
      params: { channel: channelName.value, uid: uid.value }
    });
    console.log("Token received:", data.token);

    if (!data.token) {
      throw new Error("Backend did not return a token. Check your server response.");
    }

    await client.join(APP_ID, channelName.value, data.token, uid.value);

    localAudioTrack = await AgoraRTC.createMicrophoneAudioTrack();
    localVideoTrack = await AgoraRTC.createCameraVideoTrack();


    await client.publish([localAudioTrack, localVideoTrack]);

    isJoined.value = true;
    Mic.value = true;
    Camera.value = true;

    await nextTick();

    localVideoTrack.play('local-player');
  } catch (error) {
    console.error(error);
    alert("Failed to join: " + error.message);
  } finally {
    isJoining.value = false;
  }
};

const startRecording = async () => {
  recordedBlobs = [];
  try {
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: {
        displaySurface: "browser",
        frameRate: { ideal: 30, max: 60 },
        cursor: "always" 
      },
      audio: {
        echoCancellation: true,
        noiseSuppression: true,
        systemAudio: "include", 
      },
      preferCurrentTab: true,
      selfBrowserSurface: "include"
    });

    const audioTracks = stream.getAudioTracks();
    if (audioTracks.length === 0) {
      console.warn("No audio track captured. Ensure 'Share tab audio' is checked.");
    }

    const mimeType = MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus') 
                     ? 'video/webm;codecs=vp8,opus' 
                     : 'video/webm';
                     
    mediaRecorder = new MediaRecorder(stream, { mimeType });

    mediaRecorder.ondataavailable = (event) => {
      if (event.data && event.data.size > 0) {
        recordedBlobs.push(event.data);
      }
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(recordedBlobs, { type: 'video/webm' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Meeting-Recording-${Date.now()}.webm`;
      a.click();
      window.URL.revokeObjectURL(url);
      
      stream.getTracks().forEach(track => track.stop());
    };

    mediaRecorder.start(1000); 
    isRecording.value = true;

    stream.getVideoTracks()[0].onended = () => stopRecording();

  } catch (error) {
    console.error("Recording Start Error:", error);
    alert("Could not start recording. Did you cancel the permission?");
  }
};
const stopRecording = () => {
  if (mediaRecorder && mediaRecorder.state !== 'inactive') {
    mediaRecorder.stop();
  }
  isRecording.value = false;
};

const toggleRecording = () => {
  if (isRecording.value) {
    stopRecording();
  } else {
    startRecording();
  }
};

const leaveChannel = async () => {
  if (localAudioTrack) {
    localAudioTrack.close();
    localAudioTrack = null;
  }
  if (localVideoTrack) {
    localVideoTrack.close();
    localVideoTrack = null;
  }
  if (localScreenTrack) {
    localScreenTrack.close();
    localScreenTrack = null;
  }

  if (client) {
    await client.leave();
    client = null;
    isJoined.value = false;
    Mic.value = false;
    Camera.value = false;
    ScreenShare.value = false;
    remoteUsers.value = {};

    router.push({ name: 'call' });
  }
};

onMounted(() => {
  if (route.params.roomId) {
    roomId.value = route.params.roomId;
    joinChannel();
  }
});

onUnmounted(() => {
  leaveChannel();
});
</script>

<template>
  <div class="container">
    <div v-if="!isJoined" id="join-room-container">
      <h2>Join Room</h2>
      <div class="text-field">
        <label for="room-id">Enter Room Id</label>
        <input type="text" id="room-id" v-model="roomId" placeholder="e.g. 1234" :disabled="isJoining">
      </div>
      <button @click="joinChannel" :disabled="isJoining">
        {{ isJoining ? 'Joining...' : 'Join Room' }}
      </button>
    </div>

    <div v-else id="video-container">
      <div class="video-wrapper">
        <div class="video-label">You ({{ uid }})</div>
        <div class="video-player" id="local-player"></div>

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

          <button @click="toggleRecording" :class="['record-btn', isRecording ? 'btn-recording-active' : 'btn-off']">
            <i :class="isRecording ? 'fa-solid fa-circle-stop' : 'fa-solid fa-circle-dot'"></i>
          </button>

          <button @click="leaveChannel" class="leave-btn">
            <i class="fa-solid fa-phone-slash"></i>
          </button>
        </div>
      </div>

      <div v-for="(user, remoteUid) in remoteUsers" :key="remoteUid" class="video-wrapper">
        <div class="video-label">User {{ remoteUid }}</div>
        <div class="video-player" :id="`remote-user-${remoteUid}`"></div>
      </div>
    </div>
  </div>
</template>

<style scoped>
#join-room-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  margin-top: 20vh;
  width: 30%;
  min-width: 220px;
  background-color: #d3d8fc;
  padding: 2.5rem;
  border-radius: 1rem;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  margin-left: 50%;
  transform: translateX(-50%);
}

#join-room-container h2 {
  font-size: 2rem;
  font-weight: 600;
}

.text-field {
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 0.5rem;
  font-size: 1rem;
}

.text-field input {
  padding: 0.75rem 1rem;
  font-size: 1rem;
  border-radius: 0.5rem;
  border: 1px solid #b0b6e8;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.text-field input:disabled {
  background-color: #e0e0e0;
  cursor: not-allowed;
}

.text-field input:focus {
  border-color: #4f5dff;
  box-shadow: 0 0 0 2px rgba(79, 93, 255, 0.2);
}

button:disabled {
  background-color: #999;
  cursor: wait;
}

#video-container {
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
  margin-top: 1rem;
}

.video-wrapper {
  position: relative;
  width: 100%;
  max-width: 600px;
  min-width: 300px;
  aspect-ratio: 16/9;
  background-color: black;
  border-radius: 0.5rem;
  overflow: hidden;
}

.video-player {
  width: 100%;
  height: 100%;
  background-color: #2c2c2c;
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
  padding: 5px;
  background-color: rgba(0, 0, 0, 0.2);
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

.leave-btn {
  background-color: rgb(255, 37, 37);
  color: white;
}

.controls button:hover {
  color: black
}

.btn-recording-active {
  background-color: #ff4757;
  color: white;
  animation: pulse 1.5s infinite;
}

@keyframes pulse {
  0% {
    transform: scale(1);
  }

  50% {
    transform: scale(1.1);
  }

  100% {
    transform: scale(1);
  }
}

@media (max-width: 768px) {
  .controls button {
    height: 2.3rem;
    width: 2.3rem;
  }
}
</style>