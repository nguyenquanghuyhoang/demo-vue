<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import axios from 'axios'

const router = useRouter()
const username = ref('')
const password = ref('')
const confirmPassword = ref('')
const message = ref('')
const isSuccess = ref(false)
const handleDangKy = async () => {
  if (!username.value.trim() || !password.value.trim() || !confirmPassword.value.trim()) {
    message.value = 'Vui lòng điền đầy đủ thông tin'
    isSuccess.value = false
    return
  }

  if (password.value !== confirmPassword.value) {
    message.value = 'Mật khẩu nhập lại không khớp'
    isSuccess.value = false
    return
  }

  try {
    const { data } = await axios.get('http://localhost:3000/users')
    const userExist = data.find((u) => u.username === username.value)
    if (userExist) {
      message.value = 'Tên đăng nhập đã tồn tại'
      isSuccess.value = false
      return
    }
    const newUser = { 
      username: username.value, 
      password: password.value, 
      role: 'user' 
    }

    await axios.post('http://localhost:3000/users', newUser)

    message.value = 'Đăng ký thành công! Chuyển hướng đến trang đăng nhập...'
    isSuccess.value = true

    setTimeout(() => {
      router.push('/login')
    }, 2000)
  } catch (error) {
    message.value = 'Có lỗi xảy ra khi đăng ký'
    isSuccess.value = false
    console.error(error)
  }
}


</script>

<template>
  <div class="register-container">
    <div class="register-box">
      <h2>Đăng Ký</h2>
      <form @submit.prevent="handleDangKy">
        <input type="text" v-model="username" placeholder="Tên đăng nhập" class="input-field" />
        <input type="password" v-model="password" placeholder="Mật khẩu" class="input-field" />
        <input
          type="password"
          v-model="confirmPassword"
          placeholder="Nhập lại mật khẩu"
          class="input-field"
        />
        <button type="submit" class="btn-register">Đăng Ký</button>
      </form>

      <p :class="{ success: isSuccess, error: !isSuccess }">{{ message }}</p>

      <div class="login-link">
        <span>Đã có tài khoản?</span>
        <a @click="router.push('/login')">Đăng nhập ngay</a>
      </div>
    </div>
  </div>
</template>

<style scoped>
.register-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  
}

.register-box {
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



.btn-register {
  width: 100%;
  padding: 12px;
  background-color: #1d6891;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: bold;
  transition: 0.3s;
}



.success {
  color: green;
  margin-top: 10px;
}

.error {
  color: red;
  margin-top: 10px;
}

.login-link {
  margin-top: 15px;
  font-size: 14px;
}

.login-link a {
  color: #ff7eb9;
  font-weight: bold;
  cursor: pointer;
  margin-left: 5px;
}

.login-link a:hover {
  text-decoration: underline;
}
</style>
