<script setup>
import { ref, onMounted, reactive } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const router = useRouter()

const products = ref([])
const product = reactive({
  title: '',
  price: '',
  image: '',
  category: '',
  description: ''
})

const user = ref(null)

onMounted(async () => {
  Loadulieu()
  const userData = localStorage.getItem('user')
  if (userData) {
    user.value = JSON.parse(userData)
  }
})

const handleDelete = async (id) => {
  const isConfirm = confirm(`Bạn có muốn xoá sản phẩm có id = ${id} không?`)
  if (isConfirm) {
    const response = await axios.delete(`http://localhost:3000/products/${id}`)
    if (response.status == 200) {
      Loadulieu()
      alert('Xoá thành công!')
    }
  }
}

const Loadulieu = async () => {
  console.log('Đang tải danh sách sản phẩm...')
  const response = await axios.get('http://localhost:3000/products')
  if (response.status == 200) {
    products.value = response.data
  }
}

const handleSubmit = async () => {
  if (product.title === "") {
    alert('Title không được để trống!')
    return
  }

  const payload = {
    title: product.title,
    price: product.price,
    image: product.image,
    category: product.category,
    description: product.description
  }

  const response = await axios.post('http://localhost:3000/products', payload)
  if (response.status == 201) {
    Loadulieu()
    clearData()
    alert('Thêm thành công!')
  }
}

const clearData = () => {
  Object.assign(product, {
    title: '',
    price: '',
    image: '',
    category: '',
    description: ''
  })
}

const goTo = (id) => {
  router.push(`/products/${id}`)
}

const handleLogout = () => {
  const confirmLogout = confirm('Bạn có chắc muốn đăng xuất không?')
  if (confirmLogout) {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    router.push('/login')
  }
}
</script>

<template>
  <header class="py-4 bg-white border-bottom mb-4">
    <div class="container d-flex align-items-center justify-content-between">
      <h1 class="h4 mb-0 fw-bold text-white bg-gradient px-3 py-2 rounded-3">MyShop</h1>
      <div class="d-flex gap-2">
        <div v-if="user" class="dropdown">
          <button class="btn btn-outline-dark dropdown-toggle" type="button" data-bs-toggle="dropdown">
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
              <hr class="dropdown-divider">
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

  <main class="container-fluid px-4 pb-5">
    <div class="card shadow-sm border-0 rounded-3 overflow-hidden">
      <div class="card-header bg-white py-3 px-4 d-flex justify-content-between align-items-center">
        <h5 class="mb-0 fw-semibold text-primary">Danh sách sản phẩm</h5>
      </div>

      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover align-middle mb-0">
            <thead class="table-light text-uppercase">
              <tr>
                <th style="width:100px">Ảnh</th>
                <th>Tiêu đề</th>
                <th style="width:180px">Loại</th>
                <th style="width:150px" class="text-end">Giá</th>
                <th style="width:220px" class="text-end">Hành động</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in products" :key="item.id" class="fade-row">
                <td>
                  <img class="product-thumb" :src="item.image" alt="product">
                </td>
                <td>
                  <RouterLink :to="`/products/${item.id}`" class="text-decoration-none fw-semibold text-primary">
                    {{ item.title }}
                  </RouterLink>
                </td>
                <td><span class="badge text-bg-dark">{{ item.category }}</span></td>
                <td class="text-end">{{ item.price }}</td>
                <td class="text-end">
                  <button @click="goTo(item.id)" class="btn btn-sm btn-info text-white">View</button>
                  <button @click="handleDelete(item.id)" class="btn btn-sm btn-danger text-white">Delete</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </main>

  <!-- <footer class="py-4 bg-dark text-white">
    <div class="container d-flex flex-wrap justify-content-between align-items-center gap-3">
      <span>© <span id="year">2025</span> MyShop</span>
      <a class="btn btn-outline-light btn-sm" href="#top">Back to top</a>
    </div>
  </footer> -->
</template>

<style scoped>
body {
  background: #f8f9fa;
  font-family: 'Inter', sans-serif;
}

header {
  background: linear-gradient(90deg, #007bff, #0dcaf0);
  color: white;
  box-shadow: 0 3px 10px rgba(0, 0, 0, 0.1);
}

header .btn-outline-dark {
  color: white;
  border-color: rgba(255, 255, 255, 0.7);
}

header .btn-outline-dark:hover {
  background-color: rgba(255, 255, 255, 0.2);
}

/* ===== Table ===== */
.card {
  border-radius: 14px;
  background: #fff;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.06);
}

.table {
  margin-bottom: 0;
  width: 100%;
  border-spacing: 0;
  border-collapse: separate;
}

.table thead {
  background: #f1f3f5;
  font-weight: 600;
  letter-spacing: 0.5px;
}

.table th {
  border-bottom: 2px solid #dee2e6;
}

.table-hover tbody tr:hover {
  background-color: #f8f9fa;
  transition: background-color 0.2s ease;
}

/* ===== Image ===== */
.product-thumb {
  width: 70px;
  height: 70px;
  border-radius: 8px;
  object-fit: cover;
  transition: transform 0.25s ease;
  box-shadow: 0 0 6px rgba(0, 0, 0, 0.08);
}

.product-thumb:hover {
  transform: scale(1.08);
}

/* ===== Buttons ===== */
.btn {
  border-radius: 6px;
  transition: all 0.2s ease-in-out;
  font-weight: 500;
  padding: 0.25rem 0.75rem;
}

.btn-info {
  background-color: #0dcaf0;
  border: none;
}

.btn-info:hover {
  background-color: #0bb8de;
  transform: translateY(-1px);
}

.btn-warning {
  background-color: #ffc107;
  border: none;
}

.btn-warning:hover {
  background-color: #e0a800;
  transform: translateY(-1px);
}

.btn-danger {
  background-color: #dc3545;
  border: none;
}

.btn-danger:hover {
  background-color: #bb2d3b;
  transform: translateY(-1px);
}

/* ===== Footer ===== */
footer {
  background: #212529;
  color: #dee2e6;
  text-align: center;
  font-size: 0.95rem;
  padding-top: 1.5rem;
  padding-bottom: 1.5rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

/* ===== Animation ===== */
.fade-row {
  opacity: 0;
  transform: translateY(5px);
  animation: fadeInUp 0.4s ease forwards;
}

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
