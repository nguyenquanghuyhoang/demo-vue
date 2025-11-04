<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
const router = useRouter()
const user = ref({
  id: '',
  username: '',
  email: '',
  role: '',
  tuoi: '',
  gioitinh: '',
  sanpham: '',
  avatar: 'https://i.pravatar.cc/150?img=12'
})

onMounted(() => {
  const userData = localStorage.getItem('user')
  if (userData) {
    user.value = JSON.parse(userData)
  }
})
const handleSave = async () => {
  if (!user.value.username || !user.value.email) {
    alert('Vui lòng nhập đầy đủ tên và email!')
    return
  }

  try {

    await axios.put(`http://localhost:3000/users/${user.value.id}`, user.value)
    localStorage.setItem('user', JSON.stringify(user.value))
    alert('Cập nhật hồ sơ thành công!')
  } catch (error) {
    console.error('Lỗi khi cập nhật user:', error)
    alert('Không thể lưu hồ sơ. Kiểm tra server JSON!')
  }
}
const handleDelete = async () => {
  const confirmDel = confirm('Bạn có chắc muốn xóa hồ sơ này không?')
  if (!confirmDel) return

  try {
    await axios.delete(`http://localhost:3000/users/${user.value.id}`)
    localStorage.removeItem('user')
    alert('Đã xóa hồ sơ thành công!')
    router.push('/login')
  } catch (error) {
    console.error('Lỗi khi xóa user:', error)
    alert('Không thể xóa hồ sơ. Kiểm tra server JSON!')
  }
}
const handleLogout = () => {
  const confirmLogout = confirm('Bạn có chắc muốn đăng xuất không?')
  if (confirmLogout) {
    localStorage.removeItem('user')
    localStorage.removeItem('token')
    router.push('/login')
  }
}

const handleAvatarChange = (event) => {
  const file = event.target.files[0]
  if (file) {
    const reader = new FileReader()
    reader.onload = (e) => {
      user.value.avatar = e.target.result
    }
    reader.readAsDataURL(file)
  }
}
</script>

<template>
  <div class="admin-wrapper">

    <aside class="sidebar">
      <h3>Người dùng</h3>
      <nav>
        <RouterLink to="/profile" class="nav-link">Hồ sơ</RouterLink>
        <RouterLink to="/FavoriteView" class="nav-link">Danh sách yêu thích</RouterLink>
        <RouterLink to="/donhang" class="nav-link">Đơn hàng</RouterLink>
        <RouterLink to="/postlist" class="nav-link">Trang chủ</RouterLink>
      </nav>
    </aside>

    <main class="content-area">
      <div class="profile-container">
        <div class="profile-card">
          <div class="avatar-wrapper">
            <img :src="user.avatar" alt="Avatar" class="avatar-img" />
            <div class="avatar-overlay">
              <label for="avatarUpload" class="change-avatar-btn">Thay ảnh</label>
              <input type="file" id="avatarUpload" accept="image/*" @change="handleAvatarChange" hidden />
            </div>
          </div>

          <h3 class="username">{{ user.username || 'Người dùng' }}</h3>
          <p class="role">Vai trò: {{ user.role || 'Thành viên' }}</p>
          <form class="profile-form">
            <div class="form-group">
              <label>Tên người dùng</label>
              <input v-model="user.username" type="text" class="form-control" />
            </div>

            <div class="form-group">
              <label>Email</label>
              <input disabled v-model="user.email" type="email" class="form-control" />
            </div>

            <div class="form-group">
              <label>Tuổi</label>
              <input v-model="user.tuoi" type="number" min="0" class="form-control" />
            </div>

            <div class="form-group">
              <label>Giới tính</label>
              <select v-model="user.gioitinh" class="form-control">
                <option value="">-- Chọn giới tính --</option>
                <option value="Nam">Nam</option>
                <option value="Nữ">Nữ</option>
                <option value="Khác">Khác</option>
              </select>
            </div>

            <div class="form-group">
              <label>Sản phẩm mong muốn</label>
              <input v-model="user.sanpham" type="text" class="form-control"
                placeholder="VD: Áo Hoodie Loose, Quần jean, ..." />
            </div>

            <div class="btn-group">
              <button type="button" class="btn btn-update" @click="handleSave">Lưu</button>
              <button type="button" class="btn btn-delete" @click="handleDelete">Xoá</button>
              <button type="button" class="btn btn-logout" @click="handleLogout">Đăng xuất</button>
            </div>
          </form>
        </div>
      </div>
    </main>
  </div>
</template>


<style scoped>
.admin-wrapper {
  display: flex;
  min-height: 100vh;
  background: #f1f3f6;
  font-family: 'Poppins', sans-serif;
}

.sidebar {
  width: 240px;
  background: linear-gradient(180deg, #007bff, #0dcaf0);
  color: #fff;
  padding: 2rem 1rem;
  text-align: center;
}

.sidebar h3 {
  font-size: 1.3rem;
  margin-bottom: 2rem;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.sidebar nav a {
  display: block;
  color: #fff;
  text-decoration: none;
  margin: 10px 0;
  padding: 10px;
  border-radius: 8px;
  transition: all 0.3s ease;
}

.sidebar a.active,
.sidebar a:hover {
  background: rgba(255, 255, 255, 0.2);
}

.content-area {
  flex: 1;
  padding: 3rem;
  display: flex;
  justify-content: center;
  align-items: center;
}

.profile-container {
  width: 100%;
  max-width: 500px;
}

.profile-card {
  background: #fff;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  padding: 2.5rem;
  text-align: center;
  animation: fadeIn 0.5s ease;
}

.avatar-wrapper {
  position: relative;
  display: inline-block;
  margin-bottom: 1rem;
}

.avatar-img {
  width: 140px;
  height: 140px;
  border-radius: 50%;
  object-fit: cover;
  border: 5px solid #fff;
  box-shadow: 0 0 15px rgba(0, 123, 255, 0.3);
  transition: transform 0.3s ease;
}

.avatar-wrapper:hover .avatar-img {
  transform: scale(1.05);
}

.avatar-overlay {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: rgba(0, 0, 0, 0.55);
  border-radius: 0 0 50% 50%;
  padding: 6px 0;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.avatar-wrapper:hover .avatar-overlay {
  opacity: 1;
}

.change-avatar-btn {
  color: #fff;
  font-size: 0.9rem;
  cursor: pointer;
}

.username {
  font-size: 1.4rem;
  font-weight: 600;
  margin-bottom: 0.3rem;
}

.role {
  color: #6c757d;
  font-size: 0.9rem;
  margin-bottom: 1.5rem;
}

.profile-form {
  text-align: left;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  font-weight: 600;
  margin-bottom: 0.3rem;
  display: block;
}

.form-control {
  width: 100%;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 10px;
  outline: none;
  transition: all 0.2s ease;
}

.form-control:focus {
  border-color: #007bff;
  box-shadow: 0 0 5px rgba(13, 110, 253, 0.3);
}

.btn-group {
  display: flex;
  justify-content: space-between;
  margin-top: 1.5rem;
}

.btn {
  border: none;
  padding: 10px 20px;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s ease;
}

.btn-update {
  background: linear-gradient(90deg, #007bff, #00bfff);
  color: #fff;
}

.btn-update:hover {
  background: linear-gradient(90deg, #0056d2, #0099cc);
}

.btn-delete {
  background: #ffeeba;
  color: #856404;
}

.btn-delete:hover {
  background: #ffe08a;
}

.btn-logout {
  background: #f8d7da;
  color: #dc3545;
}

.btn-logout:hover {
  background: #f5c6cb;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(15px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
