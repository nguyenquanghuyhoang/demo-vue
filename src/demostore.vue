<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'

const store = useStore()

// Lấy giá trị count từ state trong store
const demo = computed(() => store.state.count)

// Hàm xử lý khi nhấn nút
const handleButton = () => {
  // Gọi mutation hoặc action để thay đổi state
  store.commit('increment')
  console.log('Đã nhấn nút, count =', store.state.count)
}
</script>

<template>
  <div class="p-4">
    <h1>Demo Vuex</h1>
    <p>Giá trị hiện tại: {{ demo }}</p>
    <button class="btn btn-primary" @click="handleButton">Click change</button>
  </div>
</template>

<style scoped>
.btn {
  margin-top: 10px;
}
</style>
<script setup>
import { computed } from 'vue'
import { useStore } from 'vuex'

const store = useStore()

// Lấy dữ liệu từ state
const demo = computed(() => store.state.count)

// Hàm xử lý khi nhấn nút tăng
const handleClickIncrease = () => {
  store.commit('increment')
  console.log('Tăng:', store.state.count)
}

// Hàm xử lý khi nhấn nút giảm
const handleClickDecrease = () => {
  store.commit('decrement')
  console.log('Giảm:', store.state.count)
}
</script>

<template>
  <div class="p-4">
    <h1>Demo Vuex</h1>
    <p>Giá trị hiện tại: {{ demo }}</p>

    <button class="btn btn-primary me-2" @click="handleClickIncrease">
      + Tăng
    </button>

    <button class="btn btn-danger" @click="handleClickDecrease">
      - Giảm
    </button>
  </div>
</template>

<style scoped>
button {
  margin-top: 10px;
}
</style>