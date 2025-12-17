<script setup>
  const emit = defineEmits(['toggle-participants', 'toggle-chat'])
</script>

<template>
  <header id="nav">
    <div class="nav-list">
      <button id="members__button" @click="emit('toggle-participants')">
        <svg width="24" height="24" viewBox="0 0 24 24" fill-rule="evenodd" clip-rule="evenodd">
          <path d="M24 18v1h-24v-1h24zm0-6v1h-24v-1h24zm0-6v1h-24v-1h24z" fill="#ede0e0" />
        </svg>
      </button>
      <router-link to="/" class="logo-link">
        <h3 id="logo">
          <span>PeerChat</span>
        </h3>
      </router-link>
    </div>

    <div id="links">
      <button id="chat__button" @click="emit('toggle-chat')">
        <svg width="24" height="24" viewBox="0 0 24 24" fill-rule="evenodd" fill="#ede0e0">
          <path d="M24 20h-3v4l-5.333-4h-7.667v-4h2v2h6.333l2.667 2v-2h3v-8.001h-2v-2h4v12.001zm-15.667-6l-5.333 4v-4h-3v-14.001l18 .001v14h-9.667zm-6.333-2h3v2l2.667-2h8.333v-10l-14-.001v10.001z"/>
        </svg>
      </button>
      <router-link class="nav__link" id="create__room__btn" to="/">
        Create Room
        <svg width="24" height="24" fill="#ede0e0" viewBox="0 0 24 24">
          <path d="M12 0c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm6 13h-5v5h-2v-5h-5v-2h5v-5h2v5h5v2z"/>
        </svg>
      </router-link>
    </div>

  </header>
</template>

<style scoped>
 #nav{
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.4rem;
  background-color: #DCD6F7;
  border-radius: 0.5rem;
 }
 .nav-list{
  display: flex;
  gap: 2rem;
  align-items: center;
 }
 svg{
  
 }
</style>