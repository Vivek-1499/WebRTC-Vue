<script setup>
import { computed, handleError, ref } from 'vue';
import TodoCard from '../../components/TodoCard.vue';
import taskData from '@/tasks.json'
import AddTask from '../../components/AddTask.vue';

const tasks = ref(taskData.tasks)

function toggleChange(id) {
  const task = tasks.value.find(t => t.id === id);
  if (task) task.isFinished = !task.isFinished
}

function deleteTask(id) {
  tasks.value = tasks.value.filter(t => t.id !== id);
}

const handleAddTask = (title) => {
  const newId = tasks.value.length ? Math.max(...tasks.value.map(t => t.id)) + 1 : 0;
  tasks.value.push({
    id: newId,
    title,
    isFinished: false
  });
};

</script>
<template>
  <div class="wrapper">
    <div class="addtask-container">
      <AddTask @add="handleAddTask" />
    </div>

    <div id="task-container">
      <TodoCard v-for="task in tasks" :key="task.id" :id="task.id" :title="task.title" :isFinished="task.isFinished"
        @toggle="toggleChange" @delete="deleteTask" />
    </div>
  </div>
</template>


<style scoped>
.addtask-container {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem;
  padding: 1rem 2rem;
}

#task-container {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  padding: 1rem 2rem;
}

@media (max-width: 720px) {
  #task-container {
    grid-template-columns: 1fr;
  }

  .addtask-container {
    align-items: center;
  }
}
</style>
