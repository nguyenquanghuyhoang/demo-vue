<script setup>
import { ref, reactive, onMounted } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const router = useRouter()
const categories = ref([])
const category = reactive({
  id: '',
  name: '',
  description: ''
})
const user = ref(null)
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

  LoadCategories()
})

const LoadCategories = async () => {
  try {
    const res = await axios.get('http://localhost:3000/categories')
    categories.value = res.data
  } catch (err) {
    console.error('Lỗi tải danh mục:', err)
  }
}
const handleSubmit = async () => {
  if (!category.name.trim()) {
    alert('Vui lòng nhập tên danh mục!')
    return
  }

  try {
    if (category.id) {
      await axios.put(`http://localhost:3000/categories/${category.id}`, { ...category })
      alert('Cập nhật danh mục thành công!')
    } else {
      const newCat = {
        name: category.name,
        description: category.description
      }
      await axios.post('http://localhost:3000/categories', newCat)
      alert('Thêm danh mục mới thành công!')
    }

    clearForm()
    await LoadCategories()
  } catch (err) {
    console.error('Lỗi thêm/sửa danh mục:', err)
    alert('Không thể lưu danh mục, vui lòng kiểm tra console!')
  }
}
const handleDelete = async (id) => {
  if (confirm('Bạn có chắc muốn xóa danh mục này không?')) {
    try {
      await axios.delete(`http://localhost:3000/categories/${id}`)
      LoadCategories()
    } catch (err) {
      console.error('Lỗi khi xóa danh mục:', err)
    }
  }
}
const editCategory = (item) => {
  Object.assign(category, item)
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
const clearForm = () => {
  category.id = ''
  category.name = ''
  category.description = ''
}
</script>

<template>
  <div class="admin-wrapper">
    <aside class="sidebar">
      <h3>Admin Panel</h3>
      <nav>
        <nav>
          <RouterLink to="/admin" active-class="active">Sản phẩm</RouterLink>
          <RouterLink to="/quanliuser" active-class="active">Người dùng</RouterLink>
          <RouterLink to="/danhmuc" active-class="active">Danh mục</RouterLink>
          <RouterLink to="/orderAdmin" active-class="active">Quản lý đơn hàng</RouterLink>
           <RouterLink to="/thongke" active-class="active">Thống kê</RouterLink>
          <RouterLink to="/postlist" active-class="active">Trang chủ</RouterLink>
        </nav>

      </nav>
    </aside>
    <main class="main-content">
      <h2>Quản lý danh mục</h2>
      <div class="card form-card">
        <h5>{{ category.id ? "Chỉnh sửa danh mục" : "Thêm danh mục mới" }}</h5>
        <form @submit.prevent="handleSubmit">
          <div class="form-grid">
            <input v-model="category.name" placeholder="Tên danh mục" required />
          </div>
          <textarea v-model="category.description" rows="3" placeholder="Mô tả danh mục..."></textarea>
          <div class="btn-group">
            <button type="submit" class="btn-save">{{ category.id ? "Cập nhật" : "Thêm mới" }}</button>
            <button type="button" @click="clearForm" class="btn-clear">Làm mới</button>
          </div>
        </form>
      </div>
      <div class="card table-card">
        <div class="table-header">
          <h5>Danh sách danh mục</h5>
          <span class="count">{{ categories.length }} danh mục</span>
        </div>
        <table>
          <thead>
            <tr>
              <th>Tên danh mục</th>
              <th>Mô tả</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in categories" :key="item.id">
              <td class="fw-semibold">{{ item.name }}</td>
              <td>{{ item.description }}</td>
              <td>
                <button class="btn-edit" @click="editCategory(item)">Sửa</button>
                <button class="btn-delete" @click="handleDelete(item.id)">Xóa</button>
              </td>
            </tr>
            <tr v-if="categories.length === 0">
              <td colspan="3" style="text-align:center; color:#888;">Chưa có danh mục nào</td>
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

/* Main */
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
  grid-template-columns: 1fr;
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
