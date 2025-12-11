<script setup>
import { ref } from 'vue';
import emailjs from 'emailjs-com'
import { RouterLink } from 'vue-router';
const name = ref("")
const email = ref("")
const message = ref("")

const sendEmail = () => {
  const serviceID = import.meta.env.VITE_SERVICE_ID
  const templateID = import.meta.env.VITE_TEMPLATE_ID
  const publicKey = import.meta.env.VITE_PUBLIC_KEY


  const formDetail = {
    name: name.value,
    email: email.value,
    message: message.value
  
  }

  emailjs.send(serviceID, templateID, formDetail, publicKey).then((response) => {
    console.log('working', response.status, response.text)
    alert('Message sent will contact shortly')

    name.value = ''
    email.value = ''
    message.value = ''
  }, (err) => {
    console.log(err)
  })


}
</script>

<template>
  <form @submit.prevent="sendEmail">
    <h1>Contact</h1>
    <label for="name">Enter Name:</label>
    <input type="text" name="name" v-model="name" required>

    <label for="email">Enter Email:</label>
    <input type="email" name="email" id="email" v-model="email" required>

    <label for="textarea">Enter Message:</label>
    <textarea name="textarea" id="textarea" placeholder="Enter Text" v-model="message" required></textarea>
    <div class="button">

      <button type="submit">Submit</button>
      <RouterLink to="/call"><button type="button">Call</button></RouterLink>
    </div>
  </form>

</template>
<style scoped>
form {
  display: flex;
  flex-direction: column;
  align-items: center;
  background-color: #f4eeff;
  max-width: 500px;
  margin: 2rem auto;
  padding: 2rem;
  border-radius: 1rem;
  gap: 1rem;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

h1 {
  margin-bottom: 1rem;
  color: #333;
}

label {
  align-self: flex-start;
  font-weight: 500;
  margin-top: 0.5rem;
  color: #555;
}

input,
textarea {
  padding: 0.5rem 1rem;
  width: 100%;
  border-radius: 0.5rem;
  border: 1.5px solid #ccc;
  font-size: 1rem;
  transition: border-color 0.2s ease, box-shadow 0.2s ease;
}

input:focus,
textarea:focus {
  outline: none;
  border-color: #555d95;
  box-shadow: 0 0 5px rgba(186, 194, 248, 0.5);
}

textarea {
  height: 100px;
  resize: vertical;
}

.button {
  display: flex;
  gap: 1rem;
  margin-top: 1rem;
}

button {
  padding: 0.6rem 1.5rem;
  border-radius: 0.5rem;
  background-color: #424874;
  color: white;
  font-weight: bold;
  font-size: 1rem;
  cursor: pointer;
  border: none;
  transition: background-color 0.2s ease;
}

button:hover {
  background-color: #555d95;
}
</style>
