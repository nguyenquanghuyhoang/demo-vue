<script setup>
import { ref, reactive, onMounted, onBeforeUnmount } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const router = useRouter()
const products = ref([])
const categories = ref([])
const product = reactive({
  id: '',
  title: '',
  price: '',
  image: '',
  category: '',
  description: '',
  stock: 0
})
const user = ref(null)
let reloadInterval = null
const LoadProducts = async () => {
  try {
    const res = await axios.get('http://localhost:3000/products', {
      headers: {
        'Cache-Control': 'no-cache',
        'Pragma': 'no-cache',
        'Expires': '0'
      },
      params: { t: Date.now() }
    })
    products.value = res.data
    console.log('Đã tải lại danh sách sản phẩm:', new Date().toLocaleTimeString())
  } catch (err) {
    console.error('Lỗi tải sản phẩm:', err)
  }
}
const LoadCategories = async () => {
  try {
    const res = await axios.get('http://localhost:3000/categories', {
      headers: { 'Cache-Control': 'no-cache' }
    })
    categories.value = res.data
  } catch (err) {
    console.error('Không thể tải danh mục:', err)
  }
}
onMounted(async () => {
  const userData = localStorage.getItem('user')
  if (userData) {
    user.value = JSON.parse(userData)
    if (user.value.role !== 'admin') {
      alert('Bạn không có quyền truy cập!')
      router.push('/')
      return
    }
  } else {
    alert('Vui lòng đăng nhập!')
    router.push('/login')
    return
  }
  await LoadProducts()
  await LoadCategories()
  reloadInterval = setInterval(() => {
    LoadProducts()
  }, 5000)
})
onBeforeUnmount(() => {
  if (reloadInterval) clearInterval(reloadInterval)
})
const handleSubmit = async () => {
  if (!product.title.trim()) return alert('Vui lòng nhập tên sản phẩm!')
  if (product.price <= 0) return alert('Giá phải lớn hơn 0!')
  if (product.stock < 0) return alert('Số lượng tồn không hợp lệ!')
  try {
    if (product.id) {
      await axios.put(`http://localhost:3000/products/${product.id}`, { ...product })
      alert('Cập nhật thành công!')
    } else {
      const { id, ...newProduct } = product
      await axios.post('http://localhost:3000/products', newProduct)
      alert('Thêm mới thành công!')
    }
    clearForm()
    await LoadProducts()
    localStorage.setItem('products', JSON.stringify(products.value))
    console.log("Đã cập nhật localStorage sau khi thêm/sửa sản phẩm.")

  } catch (err) {
    console.error(err)
  }
}
const handleDelete = async (id) => {
  if (confirm('Bạn có chắc muốn xóa sản phẩm này không?')) {
    await axios.delete(`http://localhost:3000/products/${id}`)
    LoadProducts()
  }else {
    alert('Đã hủy thao tác xóa.')
  }
}
const editProduct = (item) => {
  Object.assign(product, item)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
const clearForm = () => {
  Object.assign(product, {
    id: '',
    title: '',
    price: '',
    image: '',
    category: '',
    description: '',
    stock: 0
  })
}
</script>
<template>
  <div class="admin-wrapper">
    <aside class="sidebar">
      <h3>Admin Panel</h3>
      <nav>
        <RouterLink to="/admin" active-class="active">Sản phẩm</RouterLink>
        <RouterLink to="/quanliuser" active-class="active">Người dùng</RouterLink>
        <RouterLink to="/danhmuc" active-class="active">Danh mục</RouterLink>
        <RouterLink to="/orderAdmin" active-class="active">Quản lý đơn hàng</RouterLink>
        <RouterLink to="/thongke" active-class="active">Thống kê</RouterLink>
        <RouterLink to="/postlist" active-class="active">Trang chủ</RouterLink>
      </nav>
    </aside>

    <main class="main-content">
      <h2>Quản lý sản phẩm</h2>
      <div class="card form-card">
        <h5>{{ product.id ? "Chỉnh sửa sản phẩm" : "Thêm sản phẩm mới" }}</h5>
        <form @submit.prevent="handleSubmit">
          <div class="form-grid">
            <input v-model="product.title" placeholder="Tên sản phẩm" required>
            <input v-model="product.price" type="number" min="0" placeholder="Giá (VNĐ)" required>

            <select v-model="product.category" required>
              <option disabled value="">Chọn danh mục</option>
              <option v-for="cate in categories" :key="cate.id" :value="cate.name">
                {{ cate.name }}
              </option>
            </select>

            <input v-model="product.image" placeholder="Link ảnh sản phẩm" required>
            <input v-model.number="product.stock" type="number" min="0" placeholder="Số lượng tồn kho" required />
          </div>

          <textarea v-model="product.description" rows="3" placeholder="Mô tả sản phẩm..."></textarea>
          <div class="btn-group">
            <button type="submit" class="btn-save">{{ product.id ? "Cập nhật" : "Thêm mới" }}</button>
            <button type="button" @click="clearForm" class="btn-clear">Làm mới</button>
          </div>
        </form>
      </div>
      <div class="card table-card">
        <div class="table-header">
          <h5>Danh sách sản phẩm</h5>
          <span class="count">{{ products.length }} sản phẩm</span>
        </div>

        <table>
          <thead>
            <tr>
              <th>Ảnh</th>
              <th>Tên sản phẩm</th>
              <th>Danh mục</th>
              <th>Giá</th>
              <th>Tồn kho</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in products" :key="item.id">
              <td><img :src="item.image" class="product-img"></td>
              <td>{{ item.title }}</td>
              <td><span class="tag">{{ item.category }}</span></td>
              <td class="price">{{ item.price.toLocaleString() }}đ</td>
              <td>
                <span v-if="item.stock === 0" class="text-danger fw-bold">Hết hàng</span>
                <span v-else-if="item.stock < 5" class="text-warning fw-bold">
                  Sắp hết ({{ item.stock }})
                </span>
                <span v-else>{{ item.stock }}</span>
              </td>

              <td>
                <button class="btn-edit" @click="editProduct(item)">Sửa</button>
                <button class="btn-delete" @click="handleDelete(item.id)">Xóa</button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </main>
  </div>
</template>

<style scoped>
.admin-wrapper {
  display: flex;
  min-height: 100vh;
  background: #f6f8fc;
  color: #333;
  font-family: 'Inter', sans-serif;
}

.sidebar {
  width: 230px;
  background: #ffffff;
  box-shadow: 2px 0 10px rgba(0, 0, 0, 0.08);
  padding: 30px 20px;
  display: flex;
  flex-direction: column;
  border-right: 1px solid #e3e6ef;
}

.sidebar h3 {
  font-weight: 700;
  color: #3b5bdb;
  margin-bottom: 25px;
  text-align: center;
}

.sidebar nav {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.sidebar a {
  text-decoration: none;
  padding: 10px 15px;
  border-radius: 8px;
  font-weight: 500;
  color: #444;
  transition: all 0.2s;
}

.sidebar a:hover,
.sidebar a.active {
  background-color: #3b5bdb;
  color: white;
}

.main-content {
  flex: 1;
  padding: 40px 50px;
}

.main-content h2 {
  color: #3b5bdb;
  font-weight: 700;
  margin-bottom: 25px;
}

.card {
  background: white;
  border-radius: 16px;
  padding: 25px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  margin-bottom: 30px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 15px;
  margin-bottom: 15px;
}

input,
select,
textarea {
  border: 1px solid #d0d7e2;
  border-radius: 10px;
  padding: 10px 12px;
  outline: none;
  transition: border 0.2s;
  font-size: 0.95rem;
}

input:focus,
select:focus,
textarea:focus {
  border-color: #3b5bdb;
  box-shadow: 0 0 0 2px rgba(59, 91, 219, 0.15);
}

.btn-group {
  display: flex;
  gap: 10px;
  margin-top: 10px;
}

.btn-save {
  background: #3b5bdb;
  color: white;
  border: none;
  border-radius: 10px;
  padding: 10px 18px;
  font-weight: 600;
  cursor: pointer;
}

.btn-save:hover {
  background: #2c47c7;
}

.btn-clear {
  background: #dee3f0;
  border: none;
  border-radius: 10px;
  padding: 10px 18px;
  font-weight: 500;
  cursor: pointer;
}

.btn-clear:hover {
  background: #cfd6e8;
}

.table-card table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}

.table-card th {
  background: #edf1fd;
  color: #333;
  font-weight: 600;
  text-align: left;
  padding: 12px;
}

.table-card td {
  padding: 12px;
  border-bottom: 1px solid #e6e9f3;
}

.table-card tr:hover {
  background: #f8faff;
}

.product-img {
  width: 55px;
  height: 55px;
  border-radius: 10px;
  object-fit: cover;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.1);
}

.price {
  color: #e74a3b;
  font-weight: 600;
}

.tag {
  background: #e8ecff;
  color: #3b5bdb;
  font-weight: 500;
  padding: 4px 10px;
  border-radius: 8px;
}

.btn-edit,
.btn-delete {
  border: none;
  padding: 6px 12px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  margin-right: 5px;
}

.btn-edit {
  background: #4e73df;
  color: white;
}

.btn-edit:hover {
  background: #3b5bdb;
}

.btn-delete {
  background: #e74a3b;
  color: white;
}

.btn-delete:hover {
  background: #c0392b;
}
</style>
