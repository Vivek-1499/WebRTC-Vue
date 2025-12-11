<script setup>

defineProps({
  id: Number,
  title: String,
  isFinished: {
    type: Boolean,
    default: false
  }
})
const emit = defineEmits(['toggle', 'delete']);
</script>

<template>
  <div class="container">
    <div class="task">
      <input type="checkbox" name="task" :id="`${id}`" :checked="isFinished" @change="emit('toggle', id)">
      <label :for="`${id}`">{{ title }}</label>
    </div>

    <div class="icon">
      <i class="pi pi-trash" :id="id" @click="emit('delete', id)"></i>
    </div>
  </div>
</template>

<style scoped>
.container {
  width: 40vw;
  min-height: 3rem;
  height: 3rem;
  background-color: #F4EEFF;
  border-radius: 0.5rem;
  margin-left: 1rem;
  margin-top: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.2rem 0.7rem;
  gap: 0.5rem;
  word-wrap: break-word;
}

@media (max-width: 720px){
  .container{
    width: 80vw;
  }
}
.container:hover{
  scale: 1.01;
  transition: 0.1s;
}

.task{
  display: flex;
  gap: 0.5rem
}
.task input {
  cursor: pointer;
}

.task label {
  cursor: pointer;
  word-break: break-word;
}

input:checked+label {
  text-decoration: line-through;
  opacity: 0.7;
}

.icon{
  color: rgb(150, 0, 0);
  padding: 1rem;
}
.icon:hover{
  cursor: pointer;
  transform: scale(1.1);
  transition: 0.2s ;
}
</style>