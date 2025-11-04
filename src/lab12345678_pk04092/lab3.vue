<script setup>
import { ref, reactive } from 'vue'

const username = ref('')
const password = ref('')
const message = ref('')
const isSuccess = ref(false)
const dtb = ref(null)

const handLeDangNhap = () => {
  if (username.value === '') {
    message.value = 'Username không được để trống'
    isSuccess.value = false
    return
  }
  if (password.value === '') {
    message.value = 'Password không được để trống'
    isSuccess.value = false
    return
  }
  if (username.value === 'admin' && password.value === '123456') {
    message.value = 'Đăng nhập thành công'
    isSuccess.value = true
  } else {
    message.value = 'Đăng nhập thất bại'
    isSuccess.value = false
  }
}

const quantity = ref(0)
const tang = () => quantity.value++
const giam = () => {
  if (quantity.value > 0) quantity.value--
}

const user = reactive({
  name: '',
  age: null,
  email: ''
})
const error = ref('')

const updateUser = () => {
  if (!user.name || !user.email || !user.age) {
    error.value = 'Vui lòng nhập đầy đủ thông tin!'
  } else if (user.age <= 0) {
    error.value = 'Tuổi không hợp lệ!'
  } else {
    error.value = ''
    alert('Cập nhật thành công!')
  }
}

const messageBinding = ref('Xin chào Vue!')
</script>

<template>
  <div class="container">
    <section>
      

      <input type="number" v-model="dtb" placeholder="Nhập điểm trung bình" step="0.1" />
      <p v-if="dtb !== null">
        <span v-if="dtb < 5">Xếp loại: Yếu</span>
        <span v-else-if="dtb < 6.5">Xếp loại: Trung bình</span>
        <span v-else-if="dtb < 8">Xếp loại: Khá</span>
        <span v-else-if="dtb < 9">Xếp loại: Giỏi</span>
        <span v-else>Xếp loại: Xuất sắc</span>
      </p>

      <form @submit.prevent="handLeDangNhap">
        <h3>Đăng nhập</h3>
        <p :class="{ success: isSuccess, error: !isSuccess }">{{ message }}</p>
        <input type="text" v-model="username" placeholder="Username..." />
        <input type="password" v-model="password" placeholder="Password..." />
        <input type="submit" value="Đăng nhập" />
      </form>
    </section>

    <section>
      <h2>Bài 1</h2>
      <p>Số lượng sản phẩm: {{ quantity }}</p>
      <button @click="giam">-</button>
      <button @click="tang">+</button>
    </section>

    <section>
      <h2>Bài 2</h2>

      <form @submit.prevent="updateUser">
        <input v-model="user.name" type="text" placeholder="Tên..." />
        <input v-model.number="user.age" type="number" placeholder="Tuổi..." />
        <input v-model="user.email" type="email" placeholder="Email..." />
        <button type="submit">Cập nhật</button>
      </form>

      <p v-if="error" class="error">{{ error }}</p>

      <div v-if="!error && user.name">
        <p><b>Tên:</b> {{ user.name }}</p>
        <p><b>Tuổi:</b> {{ user.age }}</p>
        <p><b>Email:</b> {{ user.email }}</p>
      </div>
    </section>

    <section>
      <h2>Bài 3</h2>

      <p>One-way: {{ messageBinding }}</p>
      <input v-model="messageBinding" placeholder="Nhập nội dung..." />
      <p>Two-way: {{ messageBinding }}</p>
    </section>
  </div>
</template>

<style scoped>
.container {
  width: 400px;
  margin: 20px auto;
  font-family: sans-serif;
}

h1 {
  text-align: center;
  margin-bottom: 20px;
}

section {
  margin-bottom: 30px;
  border-top: 1px solid #ccc;
  padding-top: 10px;
}

input,
button {
  display: block;
  margin: 5px 0;
  padding: 6px;
  width: 100%;
  box-sizing: border-box;
}

button,
input[type="submit"] {
  background: #42b983;
  color: white;
  border: none;
  cursor: pointer;
}
button:hover,
input[type="submit"]:hover {
  background: #2fa46e;
}

.success {
  color: green;
  font-weight: bold;
}
.error {
  color: red;
  font-weight: bold;
}
</style>
