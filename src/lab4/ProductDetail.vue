<script setup>
import { onMounted, ref, watch } from 'vue'
import axios from 'axios'
import { useRoute, useRouter } from 'vue-router'
import { useStore } from 'vuex'

const store = useStore()
const route = useRoute()
const router = useRouter() 

const product = ref(null)
const relatedProducts = ref([])
const addToCart = (item) => {
  if (item.stock === 0) {
    alert('Sản phẩm này đã hết hàng!')
    return
  }
  store.dispatch('addToCart', item)
  alert(`Đã thêm "${item.title}" vào giỏ hàng!`)
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
const loadProduct = async (id) => {
  const products = JSON.parse(localStorage.getItem("products")) || [];
  const found = products.find(p => p.id == id);
  if (found) {
    product.value = found;
  } else {
    const response = await axios.get(`http://localhost:3000/products/${id}`);
    product.value = response.data;
  }

  const relatedRes = await axios.get(`http://localhost:3000/products?category=${product.value.category}`);
  relatedProducts.value = relatedRes.data.filter(p => p.id !== product.value.id);
};


watch(() => route.params.id, (newId) => {
  loadProduct(newId)
})

onMounted(() => {
  loadProduct(route.params.id)
})
</script>

<template>
  <main class="container py-5" v-if="product">
    <div class="row align-items-start">
      <div class="col-md-6 text-center">
        <div class="position-relative">
          <img 
            :src="product.image" 
            alt="product" 
            class="img-fluid rounded shadow-sm"
            style="max-height: 450px; object-fit: contain;"
          />
          <span 
            v-if="product.stock === 0" 
            class="badge bg-danger position-absolute top-0 end-0 m-3 fs-6"
          >
            Hết hàng
          </span>
        </div>
      </div>

      <div class="col-md-6">
        <h2 class="fw-bold mb-3">{{ product.title }}</h2>
        <p class="text-muted mb-2">
          <strong>Danh mục:</strong> {{ product.category }}
        </p>
        <p class="fs-5 text-danger fw-bold mb-3">
          <strong>Giá:</strong> {{ product.price }} đ
        </p>
        <p class="text-secondary">{{ product.description }}</p>
        <p class="text-muted mt-2">
          <strong>Tồn kho:</strong> 
          <span :class="product.stock === 0 ? 'text-danger fw-bold' : 'text-success fw-bold'">
            {{ product.stock ?? 0 }}
          </span>
        </p>

        <div class="mt-4 d-flex flex-wrap gap-2">
          <button 
            @click="addToCart(product)" 
            class="btn btn-success px-4 py-2 flex-grow-1"
            :disabled="product.stock === 0"
          >
            {{ product.stock === 0 ? 'Hết hàng' : 'Thêm vào giỏ hàng' }}
          </button>
          <button 
            @click="addToFavorite" 
            class="btn btn-outline-danger px-4 py-2 flex-grow-1"
          >
            Yêu thích
          </button>
          <button 
            @click="router.push('/postlist')" 
            class="btn btn-secondary px-4 py-2 flex-grow-1"
          >
            Quay lại
          </button>
        </div>
      </div>
    </div>
    <div class="mt-5">
      <h3 class="fw-bold mb-4 text-center">Sản phẩm liên quan</h3>
      <div class="row">
        <div 
          v-for="item in relatedProducts" 
          :key="item.id" 
          class="col-md-3 col-sm-6 mb-4"
        >
          <div class="card h-100 shadow-sm border-0 product-card">
            <div class="position-relative">
              <img 
                :src="item.image" 
                class="card-img-top p-3" 
                alt="item"
                style="height: 220px; object-fit: contain;"
              />
              <span 
                v-if="item.stock === 0"
                class="badge bg-danger position-absolute top-0 end-0 m-2"
              >
                Hết hàng
              </span>
            </div>

            <div class="card-body text-center d-flex flex-column justify-content-between">
              <div>
                <h6 class="card-title mb-2 text-truncate" :title="item.title">{{ item.title }}</h6>
                <p class="text-danger fw-bold mb-1">{{ item.price }} đ</p>
                <small class="text-muted d-block mb-3">
                  Còn lại: {{ item.stock ?? 0 }}
                </small>
              </div>
              <div class="d-flex justify-content-center gap-2 mt-auto">
                <button 
                  @click="router.push(`/products/${item.id}`)" 
                  class="btn btn-primary btn-sm px-3"
                >
                  Xem chi tiết
                </button>
                <button 
                  class="btn btn-success btn-sm px-3"
                  @click="addToCart(item)"
                  :disabled="item.stock === 0"
                >
                  {{ item.stock === 0 ? 'Hết hàng' : 'Thêm giỏ' }}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </main>
</template>

<style scoped>
.btn {
  border-radius: 8px;
}

.card {
  transition: transform 0.25s ease, box-shadow 0.25s ease;
}

.card:hover {
  transform: scale(1.03);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
}

.text-truncate {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.product-card .btn {
  min-width: 110px;
}
</style>
