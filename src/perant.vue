<script setup>
import UserList from './UserList.vue'

const users = [
  { id: 1, name: 'An',   score: 9.2 },
  { id: 2, name: 'Bình', score: 8.5 },
  { id: 3, name: 'Chi',  score: 9.0 },
]
</script>

<template>
  <UserList :users="users">
    <template #default="{ user }">
      {{ user.name }} - Điểm: {{ user.score }}
    </template>
  </UserList>
</template>