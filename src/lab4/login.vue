<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'
import store from '@/store'

const router = useRouter()
const username = ref('')
const password = ref('')
const message = ref('')
const isSuccess = ref(false)

const checkLogin = async (username, password) => {
  try {
    const response = await axios.get('http://localhost:3000/users')
    if (response.status === 200) {
      const user = response.data.find(
        (item) => item.username === username && item.password === password
      )
      if (user) {
        localStorage.setItem('user', JSON.stringify(user))
        localStorage.setItem('token', user.token || '')

        store.commit('setUser', user)
        const cartKey = `cart_${user.email}`
        const savedCart = localStorage.getItem(cartKey)
        if (savedCart) {
          const cartItems = JSON.parse(savedCart)
          cartItems.forEach(item => store.commit('addToCart', item))
          console.log(`Đã load giỏ hàng cho ${user.email}`)
        } else {
          console.log(`Giỏ hàng trống cho ${user.email}`)
        }

        return true
      }
    }
  } catch (error) {
    console.error('Lỗi khi kiểm tra đăng nhập:', error)
  }
  return false
}

const handleDangNhap = async () => {
  if (!username.value.trim()) {
    message.value = 'Vui lòng nhập tên đăng nhập'
    isSuccess.value = false
    return
  }
  if (!password.value.trim()) {
    message.value = 'Vui lòng nhập mật khẩu'
    isSuccess.value = false
    return
  }

  const login = await checkLogin(username.value, password.value)

  if (login) {
    message.value = 'Đăng nhập thành công'
    isSuccess.value = true
    router.push('/postlist')
  } else {
    message.value = 'Tên đăng nhập hoặc mật khẩu không đúng'
    isSuccess.value = false
  }
}

const handleDangKy = () => {
  router.push('/register')
}
</script>

<template>
  <div class="login-container">
    <div class="login-box">
      <h2>Đăng Nhập</h2>
      <form @submit.prevent="handleDangNhap">
        <input type="text" v-model="username" placeholder="Tên đăng nhập" class="input-field" />
        <input type="password" v-model="password" placeholder="Mật khẩu" class="input-field" />
        <button type="submit" class="btn-login">Đăng Nhập</button>
      </form>

      <p :class="{ success: isSuccess, error: !isSuccess }">{{ message }}</p>

      <div class="register-link">
        <span>Bạn chưa có tài khoản?</span>
        <a @click="handleDangKy">Đăng ký ngay</a>
      </div>
    </div>
  </div>
</template>

<style scoped>
.login-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
}

.login-box {
  background-color: white;
  padding: 40px 30px;
  border-radius: 16px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  width: 400px;
  text-align: center;
}

h2 {
  margin-bottom: 25px;
  color: #333;
}

.input-field {
  width: 100%;
  padding: 12px;
  margin: 10px 0;
  border-radius: 8px;
  border: 1px solid #ccc;
  transition: 0.3s;
}

.input-field:focus {
  border-color: #6a5acd;
  outline: none;
  box-shadow: 0 0 5px rgba(106, 90, 205, 0.4);
}

.btn-login {
  width: 100%;
  padding: 12px;
  background-color: #6a5acd;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  transition: 0.3s;
}

.btn-login:hover {
  background-color: #5b4ec7;
}

.success {
  color: green;
  margin-top: 10px;
}

.error {
  color: red;
  margin-top: 10px;
}

.register-link {
  margin-top: 15px;
  font-size: 14px;
}

.register-link a {
  color: #6a5acd;
  font-weight: bold;
  cursor: pointer;
  margin-left: 5px;
}

.register-link a:hover {
  text-decoration: underline;
}
</style>
