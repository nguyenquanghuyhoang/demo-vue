<script setup>
import { ref, onMounted, reactive, computed } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'

const router = useRouter()
const store = useStore()

const products = ref([])
const topProducts = ref([])
const user = ref(null)
const product = reactive({
  title: '',
  price: '',
  image: '',
  category: '',
  description: ''
})

const cartCount = computed(() => store.state.cart?.length || 0)
const currentPage = ref(1)
const itemsPerPage = 8
const totalPages = computed(() => Math.ceil(products.value.length / itemsPerPage))
const paginatedProducts = computed(() => {
  const start = (currentPage.value - 1) * itemsPerPage
  return products.value.slice(start, start + itemsPerPage)
})
const nextPage = () => {
  if (currentPage.value < totalPages.value) currentPage.value++
}
const prevPage = () => {
  if (currentPage.value > 1) currentPage.value--
}
const goToPage = (page) => {
  currentPage.value = page
}
const Loadulieu = async () => {
  try {
    const response = await axios.get('http://localhost:3000/products', {
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
      params: { t: Date.now() }
    })
    if (response.status === 200) {
      products.value = response.data
      localStorage.setItem('products', JSON.stringify(response.data))
      await computeTopProducts()
    }
  } catch (error) {
    console.error('Lỗi khi tải sản phẩm:', error)
  }
}

async function computeTopProducts() {
  try {
    const allOrders = []
    try {
      const res = await axios.get('http://localhost:3000/orders')
      if (Array.isArray(res.data)) {
        allOrders.push(...res.data)
      }
    } catch (err) {
      console.warn('Không thể lấy đơn hàng từ db.json:', err.message)
    }

    const allKeys = Object.keys(localStorage)
    allKeys.forEach((key) => {
      if (key.startsWith('orders_')) {
        const userOrders = JSON.parse(localStorage.getItem(key)) || []
        allOrders.push(...userOrders)
      }
      if (key === 'guest_orders') {
        const guest = JSON.parse(localStorage.getItem('guest_orders') || '[]')
        allOrders.push(...guest)
      }
    })
    const stats = {}
    allOrders.forEach((order) => {
      if (!order.items) return
      order.items.forEach((it) => {
        const id = it.id
        const qty = Number(it.quantity || 0)
        const price = Number(it.price || 0)
        if (!stats[id]) {
          const p = products.value.find((x) => x.id == id) || {}
          stats[id] = {
            id,
            title: it.title || p.title || 'Sản phẩm',
            image: it.image || p.image || '',
            price: price || p.price || 0,
            totalSold: 0,
            totalRevenue: 0
          }
        }
        stats[id].totalSold += qty
        stats[id].totalRevenue += price * qty
      })
    })

    const sorted = Object.values(stats)
      .sort((a, b) => b.totalSold - a.totalSold)
      .slice(0, 5)

    topProducts.value = sorted
  } catch (err) {
    console.error('Lỗi computeTopProducts:', err)
    topProducts.value = []
  }
}

onMounted(async () => {
  await Loadulieu()

  const saved = localStorage.getItem('products')
  if (saved && !products.value.length) {
    try {
      products.value = JSON.parse(saved)
    } catch { }
  }

  const userData = localStorage.getItem('user')
  if (userData) {
    user.value = JSON.parse(userData)
  }

  await computeTopProducts()
  window.addEventListener('storage', computeTopProducts)
})

const goTo = (id) => {
  router.push(`/products/${id}`)
}

const handleLogout = () => {
  if (confirm('Bạn có chắc muốn đăng xuất không?')) {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    store.commit('setUser', null)
    router.push('/login')
  }
}
const addToCart = async (item) => {
  if (item.stock === 0) return alert('Sản phẩm này đã hết hàng!')
  store.dispatch('addToCart', item)
  alert(`Đã thêm "${item.title}" vào giỏ hàng!`)
  const userData = JSON.parse(localStorage.getItem('user'))
  const username = userData?.username || 'guest'

  try {
    const response = await axios.get(
      `http://localhost:3000/cart?user=${username}&productId=${item.id}`
    )

    if (response.data.length > 0) {
      const existing = response.data[0]
      await axios.patch(`http://localhost:3000/cart/${existing.id}`, {
        quantity: existing.quantity + 1
      })
    } else {
      await axios.post('http://localhost:3000/cart', {
        productId: item.id,
        title: item.title,
        price: item.price,
        quantity: 1,
        image: item.image || '',
        user: username,
        addedAt: new Date().toISOString()
      })
    }

    console.log(`Đã lưu giỏ hàng vào db.json cho user: ${username}`)
  } catch (err) {
    console.error('Lỗi khi lưu giỏ hàng vào db.json:', err.message)
  }
}
</script>

<template>
  <header class="py-4 bg-white border-bottom mb-4">
    <div class="container d-flex align-items-center justify-content-between">
      <div class="d-flex align-items-center gap-4">
        <RouterLink to="/" class="text-decoration-none">
          <h1 class="h4 mb-0 fw-bold text-white bg-gradient px-3 py-2 rounded-3 shadow-sm">
            Hoangsellclothes
          </h1>
        </RouterLink>

        <nav class="d-flex align-items-center gap-3">
          <RouterLink to="/" class="nav-btn">Trang chủ</RouterLink>
          <RouterLink to="/products" class="nav-btn">Sản phẩm</RouterLink>
        </nav>
      </div>

      <div class="d-flex align-items-center gap-3">
        <RouterLink to="/cart" class="btn btn-outline-light position-relative">
          <i class="bi bi-cart4"></i> Giỏ hàng
          <span v-if="cartCount > 0"
            class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
            {{ cartCount }}
          </span>
        </RouterLink>
        <div v-if="user" class="dropdown">
          <button class="btn btn-outline-light dropdown-toggle" type="button" data-bs-toggle="dropdown">
            {{ user.username || 'Tài khoản' }}
          </button>
          <ul class="dropdown-menu dropdown-menu-end">
            <li v-if="user.role === 'admin'">
              <RouterLink class="dropdown-item" to="/admin">Quản lý</RouterLink>
            </li>
            <li v-else>
              <RouterLink class="dropdown-item" to="/profile">Hồ sơ</RouterLink>
            </li>
            <li>
              <hr class="dropdown-divider" />
            </li>
            <li>
              <button class="dropdown-item text-danger" @click="handleLogout">Đăng xuất</button>
            </li>
          </ul>
        </div>
        <div v-else>
          <RouterLink to="/login" class="btn btn-primary">Đăng nhập</RouterLink>
        </div>
      </div>
    </div>
  </header>

  <main class="container py-5">
    <section class="banner-section mb-5">
      <div id="bannerCarousel" class="carousel slide" data-bs-ride="carousel" data-bs-interval="4000">
        <div class="carousel-inner rounded-4 shadow-sm">
          <div class="carousel-item active">
            <img src="https://hoangsellclothes.xyz/wp-content/uploads/2025/09/banner_thoi_trang_cao_cap-1400x764.jpg"
              class="d-block w-100 banner-img" alt="Banner 1" />
          </div>
          <div class="carousel-item">
            <img src="https://hoangsellclothes.xyz/wp-content/uploads/2025/10/image-41-1400x788.png"
              class="d-block w-100 banner-img" alt="Banner 2" />
          </div>
        </div>
        <button class="carousel-control-prev" type="button" data-bs-target="#bannerCarousel" data-bs-slide="prev">
          <span class="carousel-control-prev-icon" aria-hidden="true"></span>
          <span class="visually-hidden">Trước</span>
        </button>
        <button class="carousel-control-next" type="button" data-bs-target="#bannerCarousel" data-bs-slide="next">
          <span class="carousel-control-next-icon" aria-hidden="true"></span>
          <span class="visually-hidden">Sau</span>
        </button>
      </div>
    </section>
    <section class="mb-5">
      <h3 class="fw-bold mb-3 text-primary text-center">Top 5 sản phẩm bán chạy</h3>
      <div v-if="topProducts.length === 0" class="text-center text-muted mb-3">
        Chưa có dữ liệu bán hàng.
      </div>
      <div v-else class="top-list">
        <div v-for="p in topProducts" :key="p.id" class="top-card">
          <img :src="p.image" class="top-thumb" :alt="p.title" />
          <div class="top-body">
            <h6 class="mb-1 text-truncate" :title="p.title">{{ p.title }}</h6>
            <div class="small text-muted">Đã bán: <strong>{{ p.totalSold }}</strong></div>
            <div class="small text-primary fw-bold">{{ (p.price || 0).toLocaleString() }} đ</div>
            <div class="small text-danger">Doanh thu: {{ (p.totalRevenue || 0).toLocaleString() }} đ</div>
            <div class="btn-group">
              <button class="btn btn-info" @click="goTo(p.id)">Xem chi tiết</button>
              <button class="btn btn-success" @click="addToCart(p)">Thêm vào giỏ</button>
            </div>
          </div>
        </div>
      </div>
    </section>
    <h3 class="fw-bold mb-4 text-primary text-center">Danh sách sản phẩm</h3>
    <div class="row g-4">
      <div v-for="item in paginatedProducts" :key="item.id" class="col-12 col-sm-6 col-md-4 col-lg-3 fade-row">
        <div class="card h-100 border-0 shadow-sm rounded-4 overflow-hidden">
          <div class="position-relative">
            <img :src="item.image" class="card-img-top product-thumb" :alt="item.title" />
            <span class="badge position-absolute top-0 start-0 m-2 bg-dark">{{ item.category }}</span>
            <span v-if="item.stock === 0" class="badge position-absolute top-0 end-0 m-2 bg-danger">Hết hàng</span>
          </div>
          <div class="card-body d-flex flex-column justify-content-between">
            <h6 class="fw-semibold text-truncate mb-2">{{ item.title }}</h6>
            <p class="text-primary fw-bold mb-1">{{ item.price }} đ</p>
            <small class="text-muted mb-3">Còn lại: {{ item.stock ?? 0 }}</small>
            <button @click="goTo(item.id)" class="btn btn-info w-100 text-white mt-auto">
              Xem chi tiết
            </button>
            <button @click="addToCart(item)" class="btn btn-success w-100 mt-2" :disabled="item.stock === 0">
              {{ item.stock === 0 ? 'Hết hàng' : 'Thêm vào giỏ hàng' }}
            </button>
          </div>
        </div>
      </div>
    </div>
    <nav v-if="totalPages > 1" class="mt-5">
      <ul class="pagination justify-content-center">
        <li class="page-item" :class="{ disabled: currentPage === 1 }">
          <button class="page-link" @click="prevPage">« Trước</button>
        </li>
        <li v-for="page in totalPages" :key="page" class="page-item" :class="{ active: page === currentPage }">
          <button class="page-link" @click="goToPage(page)">{{ page }}</button>
        </li>
        <li class="page-item" :class="{ disabled: currentPage === totalPages }">
          <button class="page-link" @click="nextPage">Sau »</button>
        </li>
      </ul>
    </nav>
  </main>
</template>

<style scoped>
.page-link {
  color: #007bff;
  border-radius: 8px;
  transition: all 0.2s ease;
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

body {
  background: #f8f9fa;
  font-family: 'Inter', sans-serif;
}

header {
  background: linear-gradient(90deg, #007bff, #0dcaf0);
  color: white;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
}

.nav-btn {
  color: white;
  font-weight: 500;
  text-decoration: none;
  padding: 8px 14px;
  border-radius: 8px;
  transition: all 0.2s ease-in-out;
}

.nav-btn:hover,
.router-link-exact-active.nav-btn {
  background: rgba(255, 255, 255, 0.25);
}

header .btn-outline-light {
  color: white;
  border-color: rgba(255, 255, 255, 0.7);
}

header .btn-outline-light:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

.card {
  transition: all 0.25s ease;
  display: flex;
  flex-direction: column;
}

.card:hover {
  transform: translateY(-6px);
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.08);
}

.product-thumb {
  width: 100%;
  height: 230px;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.product-thumb:hover {
  transform: scale(1.05);
}

.btn {
  border-radius: 8px;
  transition: all 0.2s ease-in-out;
  font-weight: 500;
}

.card-body {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  align-items: center;
}

.card-body .btn-group {
  display: flex;
  justify-content: center;
  gap: 8px;
  width: 100%;
  margin-top: 8px;
}

.card-body .btn-group .btn {
  flex: 1;
  font-size: 0.9rem;
  padding: 8px 0;
  font-weight: 600;
  border-radius: 10px;
  transition: all 0.25s ease-in-out;
}

.btn-info {
  background-color: #0dcaf0;
  border: none;
  color: #fff;
}

.btn-info:hover {
  background-color: #0bb8de;
  transform: translateY(-1px);
}

.btn-success {
  background-color: #198754;
  border: none;
  color: #fff;
}

.btn-success:hover {
  background-color: #157347;
  transform: translateY(-1px);
}

.top-list {
  display: flex;
  justify-content: center;
  align-items: stretch;
  flex-wrap: nowrap;
  gap: 1rem;
  margin: 2rem auto;
  overflow-x: auto;
  padding-bottom: 1rem;
}

.top-card {
  flex: 0 0 18%;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  background: #fff;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  padding: 1rem;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
}

.top-card:hover {
  transform: translateY(-6px);
  box-shadow: 0 8px 18px rgba(0, 0, 0, 0.08);
}

.top-thumb {
  width: 100%;
  height: 180px;
  object-fit: cover;
  border-radius: 10px;
  margin-bottom: 0.75rem;
}

.top-body h6 {
  font-size: 1rem;
  margin: 0.25rem 0;
  color: #333;
  font-weight: 600;
}

.top-body p {
  margin: 0;
  font-size: 0.9rem;
  color: #555;
}

.top-body .revenue {
  color: #e74a3b;
  font-weight: 600;
  margin-top: 0.25rem;
}

.top-body .btn {
  font-size: 0.85rem;
  padding: 6px 10px;
  border-radius: 8px;
  font-weight: 600;
  transition: all 0.25s ease;
}

.top-body .btn-info {
  background-color: #0dcaf0;
  color: #fff;
  border: none;
}

.top-body .btn-info:hover {
  background-color: #0bb8de;
  transform: translateY(-2px);
}

.top-body .btn-success {
  background-color: #198754;
  color: #fff;
  border: none;
}

.top-body .btn-success:hover {
  background-color: #157347;
  transform: translateY(-2px);
}

@media (max-width: 992px) {
  .top-card {
    flex: 0 0 45%;
  }
}

@media (max-width: 576px) {
  .top-list {
    flex-wrap: wrap;
    justify-content: center;
  }

  .top-card {
    flex: 0 0 90%;
  }
}

.banner-section {
  width: 100%;
  max-width: 1300px;
  margin: 0 auto 2rem auto;
}

.banner-img {
  width: 100%;
  height: 580px;
  object-fit: cover;
  border-radius: 18px;
  transition: transform 0.5s ease-in-out;
}

.carousel-inner {
  border-radius: 18px;
  overflow: hidden;
}

.carousel-item img:hover {
  transform: scale(1.02);
}

.carousel-control-prev-icon,
.carousel-control-next-icon {
  filter: invert(1);
}

@media (max-width: 768px) {
  .banner-img {
    height: 220px;
  }
}
</style>
