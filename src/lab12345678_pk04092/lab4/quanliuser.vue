<script setup>
import { ref, onMounted, watch } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'

const router = useRouter()
const users = ref([])
const user = ref(null)
const editingUser = ref(null)
const formData = ref({
  username: '',
  email: '',
  password: '',
  role: 'user'
})

onMounted(() => {
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
  loadUsers()
})

const loadUsers = async () => {
  try {
    const res = await axios.get('http://localhost:3000/users')
    users.value = res.data
  } catch (err) {
    console.error('Không thể tải danh sách người dùng:', err)
  }
}
const addUser = async () => {
  if (!formData.value.username || !formData.value.email || !formData.value.password) {
    alert('Vui lòng điền đầy đủ thông tin!')
    return
  }

  try {
    await axios.post('http://localhost:3000/users', formData.value)
    alert('Thêm người dùng thành công!')
    formData.value = { username: '', email: '', password: '', role: 'user' }
    loadUsers()
  } catch (err) {
    console.error('Lỗi khi thêm người dùng:', err)
  }
}
const deleteUser = async (id, role) => {
  if (role === 'admin') {
    alert('Không thể xóa tài khoản admin!')
    return
  }

  if (confirm('Bạn có chắc muốn xóa người dùng này không?')) {
    try {
      await axios.delete(`http://localhost:3000/users/${id}`)
      users.value = users.value.filter(u => u.id !== id)
      alert('Xóa thành công!')
    } catch (err) {
      console.error(err)
    }
  }
}
const editUser = (u) => {
  editingUser.value = { ...u }
  formData.value = {
    username: u.username,
    email: u.email,
    password: '',
    role: u.role
  }
}
const updateUser = async () => {
  if (!formData.value.username || !formData.value.email) {
    alert('Vui lòng nhập đầy đủ thông tin!')
    return
  }

  try {
    await axios.put(`http://localhost:3000/users/${editingUser.value.id}`, {
      ...editingUser.value,
      username: formData.value.username,
      email: formData.value.email,
      role: formData.value.role
    })
    alert('Cập nhật người dùng thành công!')
    editingUser.value = null
    formData.value = { username: '', email: '', password: '', role: 'user' }
    loadUsers()
  } catch (err) {
    console.error('Lỗi khi cập nhật:', err)
  }
}

const cancelEdit = () => {
  editingUser.value = null
  formData.value = { username: '', email: '', password: '', role: 'user' }
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
      <h2>Quản lý người dùng</h2>
      <div class="card form-card">
        <h4>{{ editingUser ? 'Sửa người dùng' : 'Thêm người dùng mới' }}</h4>

        <div class="form-grid">
          <input
            v-model="formData.username"
            placeholder="Tên đăng nhập"
          />
          <input
            v-model="formData.email"
            placeholder="Email"
            type="email"
          />
          <input
            v-if="!editingUser"
            v-model="formData.password"
            type="password"
            placeholder="Mật khẩu"
          />

          <select v-model="formData.role">
            <option value="user">Người dùng</option>
            <option value="admin">Quản trị</option>
          </select>
          <div class="button-group">
            <button
              v-if="editingUser"
              class="btn-update"
              @click="updateUser"
            >
              Cập nhật
            </button>

            <button
              v-if="editingUser"
              class="btn-cancel"
              @click="cancelEdit"
            >
              Hủy
            </button>

            <button
              v-else
              class="btn-add"
              @click="addUser"
            >
              Thêm
            </button>
          </div>
        </div>
      </div>
      <div class="card table-card">
        <div class="table-header">
          <h5>Danh sách người dùng</h5>
          <span class="count">{{ users.length }} tài khoản</span>
        </div>

        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Tên đăng nhập</th>
              <th>Email</th>
              <th>Vai trò</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="u in users" :key="u.id">
              <td>{{ u.id }}</td>
              <td>{{ u.username }}</td>
              <td>{{ u.email }}</td>
              <td>{{ u.role }}</td>
              <td>
                <button class="btn-edit" @click="editUser(u)">Sửa</button>
                <button
                  class="btn-delete"
                  :disabled="u.role === 'admin'"
                  :class="{ disabled: u.role === 'admin' }"
                  @click="deleteUser(u.id, u.role)"
                >
                  Xóa
                </button>
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

.card {
  background: white;
  border-radius: 16px;
  padding: 25px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  margin-bottom: 30px;
}

.form-card h4 {
  color: #3b5bdb;
  margin-bottom: 15px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 10px;
}

.form-grid input,
.form-grid select {
  padding: 8px;
  border-radius: 8px;
  border: 1px solid #dcdfe6;
}

.button-group {
  display: flex;
  gap: 8px;
}

.btn-add {
  background: #3b5bdb;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 14px;
  cursor: pointer;
}
.btn-update {
  background: #2ecc71;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 14px;
  cursor: pointer;
}
.btn-cancel {
  background: #7f8c8d;
  color: white;
  border: none;
  border-radius: 8px;
  padding: 8px 14px;
  cursor: pointer;
}
.btn-edit {
  background: #27ae60;
  border: none;
  color: white;
  border-radius: 8px;
  padding: 6px 12px;
  cursor: pointer;
}
.btn-delete {
  background: #e74a3b;
  border: none;
  color: white;
  border-radius: 8px;
  padding: 6px 12px;
  cursor: pointer;
}
.btn-delete.disabled {
  background: #ccc;
  cursor: not-allowed;
}
.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 15px;
}
th,
td {
  padding: 12px;
  border-bottom: 1px solid #e6e9f3;
}
th {
  background: #edf1fd;
  text-align: left;
}
</style> 