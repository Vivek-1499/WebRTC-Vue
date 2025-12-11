<script setup>
import { computed, ref } from 'vue'
import taskData from "@/tasks.json"

const props = defineProps({
  maxlen: { type: Number, default: 50 }
});

const emit = defineEmits(['add']);

const newTask = ref("")

const remaining = computed(() => props.maxlen - newTask.value.length);
const fewRemain = computed(() => remaining.value <= 20);

const addTask = () => {
  const task = newTask.value.trim()
  if (!task) {
    alert("Task field should not be empty");
    return
  }

  emit('add', task)
  const newId = tasks.value.length ? Math.max(...tasks.value.map(t => t.id)) + 1 : 0;

  tasks.value.push({
    id: newId,
    title: task,
    isFinished: false
  })

  newTask.value = ""
}
</script>

<template>
  <div class="addTask">
    <input type="text" v-model="newTask" placeholder="Enter Task" :maxlength="maxlen">
    <button @click="addTask">Add Task</button>
  </div>
  <div class="remain" :class="{ fewRemain: fewRemain }">
    {{ remaining }} remaining
  </div>
</template>

<style scoped>
.remain {
  display: flex;
  justify-content: right;
  margin-right: 10rem;
}

.fewRemain {
  color: red;
  font-weight: bold;
}

.addTask {
  display: flex;
  gap: 0.5rem;
}

.addTask input {
  padding: 0.5rem;
  min-width: 200px;
  border-radius: 0.3rem;
  border: 2px solid rgb(219, 219, 219);
  transition: border-color 0.2s ease;

}

.addTask button {
  padding-left: 0.5rem;
  padding-right: 0.5rem;
  background-color: #424874;
  color: white;
  border-radius: 0.5rem;
  font-weight: bolder;
}

.addTask button:hover {
  cursor: pointer;
  background-color: #555d95;
}

.addTask input:focus {
  outline: none;
  border: 2px solid #555d95;
  background-color: rgb(248, 248, 248);
}
</style>