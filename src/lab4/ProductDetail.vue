<script setup>
import { onMounted, ref } from 'vue'
import axios from 'axios'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter() 
const product = ref(null)

const buyNow = () => {
  alert(`Bạn đã mua sản phẩm: ${product.value.title}`)
}

const addToFavorite = () => {
  let favorites = JSON.parse(localStorage.getItem('favorites')) || []
  const exists = favorites.find(p => p.id === product.value.id)
  if (!exists) {
    favorites.push(product.value)
    localStorage.setItem('favorites', JSON.stringify(favorites))
    alert('Đã thêm vào danh sách yêu thích!')
  } else {
    alert('Sản phẩm này đã có trong danh sách yêu thích.')
  }
}

onMounted(async () => {
  const id = route.params.id
  const response = await axios.get(`http://localhost:3000/products/${id}`)
  product.value = response.data
})
</script>

<template>
  <main class="container py-5" v-if="product">
    <h1>{{ product.title }}</h1>
    <img :src="product.image" alt="" style="max-width:300px;border-radius:10px;">
    <p class="mt-3"><strong>Category:</strong> {{ product.category }}</p>
    <p><strong>Price:</strong> {{ product.price }} USD</p>
    <p>{{ product.description }}</p>

    <div class="mt-4">
      <button @click="buyNow" class="btn btn-success me-2">
        Mua ngay
      </button>
      <button @click="addToFavorite" class="btn btn-outline-danger me-2">
        Thêm vào yêu thích
      </button>
      <button @click="router.push('/postlist')" class="btn btn-secondary">
        Quay lại
      </button>
    </div>
  </main>
</template>
