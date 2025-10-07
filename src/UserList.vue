<script setup>
defineProps({
  users: {
    type: Array,
    required: true
  }
})
</script>

<template>
  <div>
    <h3>Danh sách người dùng</h3>
    <ul>
      <li v-for="user in users" :key="user.id">
        <slot :user="user"></slot>
      </li>
    </ul>
  </div>
</template>