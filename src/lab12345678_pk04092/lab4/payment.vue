<script setup>
import { ref, onMounted } from 'vue'
import axios from 'axios'
import { useRouter, useRoute } from 'vue-router'
import { useStore } from 'vuex'

const route = useRoute()
const router = useRouter()
const store = useStore()

const message = ref("")
const status = ref("loading")

onMounted(async () => {
  try {
    const res = await axios.get(`http://localhost/vnpay/returnVnpay.php`, {
      params: route.query
    })
    message.value = res.data.message
    status.value = res.data.status

    if (status.value === 'success') {
      localStorage.removeItem('cart')
      store.commit('CLEAR_CART')
      router.push('/paymentSuccess')
    } else {
      router.push('/paymentFailed')
    }
  } catch (error) {
    console.error('Lỗi khi xác nhận thanh toán:', error)
    router.push('/paymentFailed')
  }
})
</script>

<template>
  <div class="text-center mt-10">
    <h2>Đang xử lý thanh toán, vui lòng đợi...</h2>
  </div>
</template>
