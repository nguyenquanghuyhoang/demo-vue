<script setup>
import { ref, onMounted, computed } from "vue"
import axios from "axios"
import { useRouter } from "vue-router"

const router = useRouter()
const products = ref([])
const categories = ref(["Áo hoodie", "Áo polo", "Áo sơ mi", "Áo thun"])
const priceRange = ref([0, 500])
const selectedCategory = ref("")
const sortOption = ref("default")
const currentPage = ref(1)
const itemsPerPage = 6

const loadProducts = async () => {
  try {
    const res = await axios.get("http://localhost:3000/products")
    products.value = res.data
  } catch (err) {
    console.error("Lỗi tải sản phẩm:", err)
  }
}

onMounted(loadProducts)

const filteredProducts = computed(() => {
  return products.value
    .filter(
      (p) =>
        (!selectedCategory.value ||
          p.category.toLowerCase().includes(selectedCategory.value.toLowerCase())) &&
        p.price >= priceRange.value[0] * 1000 &&
        p.price <= priceRange.value[1] * 1000
    )
    .sort((a, b) => {
      if (sortOption.value === "price-asc") return a.price - b.price
      if (sortOption.value === "price-desc") return b.price - a.price
      return 0
    })
})
const totalPages = computed(() => Math.ceil(filteredProducts.value.length / itemsPerPage))
const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return filteredProducts.value.slice(start, start + itemsPerPage)
})
const changePage = (page) => {
  if (page >= 1 && page <= totalPages.value) {
    currentPage.value = page
    window.scrollTo({ top: 0, behavior: "smooth" })
  }
}

const goToDetail = (id) => {
  router.push(`/products/${id}`)
}
</script>

<template>
  <div class="product-page">
    <header class="navbar">
      <div class="container">
        <div class="left-nav">
          <RouterLink to="/" class="logo">Hoangsellclothes</RouterLink>
          <nav class="menu">
            <RouterLink to="/" class="link">Trang chủ</RouterLink>
            <RouterLink to="/products" class="link active">Sản phẩm</RouterLink>
          </nav>
        </div>
        <div class="right-nav">
          <RouterLink to="/cart" class="cart-btn">
            <i class="bi bi-cart4"></i> Giỏ hàng
          </RouterLink>
        </div>
      </div>
    </header>
    <section class="container mt-4">
      <div class="breadcrumb">
        <RouterLink to="/" class="text-muted">TRANG CHỦ</RouterLink>
        <span>/</span>
        <span class="fw-bold text-primary">SẢN PHẨM</span>
      </div>

      <div class="row mt-4">
        <aside class="col-lg-3 col-md-4 col-12 mb-4">
          <div class="sidebar p-3 rounded shadow-sm bg-white">
            <h5 class="fw-bold mb-3">DUYỆT QUA</h5>
            <ul class="list-unstyled mb-4">
              <li v-for="c in categories" :key="c" class="category-item" :class="{ active: selectedCategory === c }"
                @click="selectedCategory = c">
                {{ c }}
              </li>
            </ul>

            <h5 class="fw-bold mb-2">LỌC THEO GIÁ</h5>
            <input type="range" min="0" max="500" step="10" v-model="priceRange[1]" class="form-range" />
            <p class="text-muted small">
              Giá: {{ priceRange[0] }}k – {{ priceRange[1] }}k
            </p>
            <button class="btn btn-dark btn-sm w-100" @click="loadProducts">Lọc</button>
          </div>
        </aside>
        <div class="col-lg-9 col-md-8 col-12">
          <div class="d-flex justify-content-end mb-3">
            <select v-model="sortOption" class="form-select w-auto">
              <option value="default">Sắp xếp mặc định</option>
              <option value="price-asc">Giá tăng dần</option>
              <option value="price-desc">Giá giảm dần</option>
            </select>
          </div>

          <div class="row g-4">
            <div v-for="p in paginatedProducts" :key="p.id" class="col-12 col-sm-6 col-md-4 col-lg-4">
              <div class="card border-0 shadow-sm rounded-4 overflow-hidden">
                <div class="position-relative">
                  <img :src="p.image" class="card-img-top" alt="" />
                </div>
                <div class="card-body">
                  <p class="text-uppercase small text-muted mb-1">{{ p.category }}</p>
                  <h6 class="fw-semibold">{{ p.title }}</h6>
                  <p class="fw-bold text-primary mb-2">
                    {{ p.price.toLocaleString() }}đ
                  </p>

                  <button class="btn btn-outline-primary w-100" @click="goToDetail(p.id)">
                    Xem chi tiết
                  </button>
                </div>
              </div>
            </div>
          </div>
          <nav v-if="totalPages > 1" class="d-flex justify-content-center mt-4">
            <ul class="pagination">
              <li class="page-item" :class="{ disabled: currentPage === 1 }" @click="changePage(currentPage - 1)">
                <a class="page-link" href="#">«</a>
              </li>

              <li v-for="page in totalPages" :key="page" class="page-item" :class="{ active: currentPage === page }"
                @click="changePage(page)">
                <a class="page-link" href="#">{{ page }}</a>
              </li>

              <li class="page-item" :class="{ disabled: currentPage === totalPages }"
                @click="changePage(currentPage + 1)">
                <a class="page-link" href="#">»</a>
              </li>
            </ul>
          </nav>
        </div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.product-page {
  background: #f5f6fa;
  min-height: 100vh;
  font-family: "Inter", sans-serif;
}

.navbar {
  background: linear-gradient(90deg, #00a8ff, #0097e6);
  padding: 16px 0;
  color: white;
}

.navbar .container {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.left-nav {
  display: flex;
  align-items: center;
  gap: 24px;
}

.logo {
  font-size: 1.5rem;
  color: white;
  font-weight: 700;
  text-decoration: none;
}

.menu .link {
  color: white;
  text-decoration: none;
  padding: 6px 14px;
  border-radius: 8px;
  transition: 0.3s;
}

.menu .link:hover,
.menu .active {
  background: rgba(255, 255, 255, 0.25);
}

.sidebar {
  background: white;
}

.category-item {
  cursor: pointer;
  padding: 6px 0;
  transition: 0.2s;
}

.category-item:hover {
  color: #0097e6;
}

.category-item.active {
  font-weight: 600;
  color: #0097e6;
}

/* 🛍️ Sản phẩm */
.card-img-top {
  height: 260px;
  object-fit: cover;
}

.card {
  transition: all 0.3s ease;
}

.card:hover {
  transform: translateY(-6px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
}

.pagination {
  gap: 6px;
}

.page-link {
  color: #007bff;
  border-radius: 8px;
  transition: all 0.2s ease;
  border: 1px solid #dee2e6;
}

.page-link:hover {
  background-color: #007bff;
  color: #fff;
}

.page-item.active .page-link {
  background-color: #007bff;
  border-color: #007bff;
  color: #fff;
}

.page-item.disabled .page-link {
  color: #ccc;
  pointer-events: none;
  background-color: #f1f1f1;
}
</style>
