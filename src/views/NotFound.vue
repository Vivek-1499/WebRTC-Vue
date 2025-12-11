<script setup>
import { RouterLink } from 'vue-router';
</script>

<template>
  <section class="container">
    <i class="pi pi-exclamation-triangle icon"></i>
    <h1>404 Not Found</h1>
    <p>This page does not exist</p>
    <RouterLink class="btn" to="/">Go Back</RouterLink>
  </section>
</template>

<style scoped>
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 70vh;
  gap: 1rem;
  text-align: center;
}

.icon {
  font-size: 5rem;
  color: orange;
}

h1 {
  font-size: 2.5rem;
  color: #333;
  margin: 0;
}

p {
  font-size: 1.2rem;
  color: #666;
}

.btn {
  margin-top: 1rem;
  padding: 0.6rem 1.2rem;
  background-color: #424874;
  color: white;
  border-radius: 0.5rem;
  text-decoration: none;
  font-weight: bold;
  transition: background-color 0.2s ease;
}

.btn:hover {
  background-color: #555d95;
}
</style>
