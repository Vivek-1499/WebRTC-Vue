<script setup>
import { RouterView, useRoute } from 'vue-router';
import Navbar from '../components/Navbar.vue';
import { computed } from 'vue';

const route = useRoute()

const showGlobalNav = computed(()=>{
  return !route.meta.hideNavBar
})

</script>

<template>
  <Navbar v-if="showGlobalNav"/>
  <RouterView/>
  
</template>

<style scoped></style>
