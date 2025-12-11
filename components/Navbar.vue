<script setup>
import { RouterLink } from 'vue-router';



</script>


<template>
  <nav>
    <RouterLink to="/" class="nav-el">
      Home
    </RouterLink>
    <RouterLink to="/about" class="nav-el"> 
      About
    </RouterLink>
    <RouterLink to="/contact" class="nav-el">
      Contact
    </RouterLink>
  </nav>
</template>

<style scoped>

nav{
  display: flex;
  justify-content: space-around;
  align-items: center;
  width: 40vw;
  height: 3rem;
  background-color: #DCD6F7;
  margin: auto;
  border-radius: 0.9rem;
  margin-top: 1rem;
  box-shadow:10px 5px 10px rgb(238, 220, 255);
}
@media(max-width: 720px){
  nav{
    width: 80vw
  }
}
.nav-el{
  text-decoration: none;
  font-weight: 900;
  color: black;
  padding: 0.5rem;
  border-radius: 0.5rem;
}

.router-link-exact-active{             
  color: black;
  padding: 0.5rem;
  border-radius: 0.5rem;
  background-color: #F4EEFF;
}
.nav-el:hover{
  background-color: #42487468;
  color: white;
  padding: 0.5rem;
  border-radius: 0.5rem;

}


</style>
