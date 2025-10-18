<script setup>
import { ref, onMounted, reactive, computed } from 'vue'
import axios from 'axios'
import { useRouter } from 'vue-router'
import { useStore } from 'vuex'

const router = useRouter()
const store = useStore()

const products = ref([])
const favorites = ref([])
const removeFavorite = (id) => {
    favorites.value = favorites.value.filter(item => item.id !== id)
    localStorage.setItem('favorites', JSON.stringify(favorites.value))
}
onMounted(() => {
    favorites.value = JSON.parse(localStorage.getItem('favorites')) || []
})
const goTo = (id) => {
    router.push(`/products/${id}`)
}

</script>

<template>
    <div class="admin-wrapper">
        <aside class="sidebar">
            <h3>Người dùng</h3>
            <nav>
                <RouterLink to="/profile" class="nav-link">Hồ sơ</RouterLink>
                <RouterLink to="/FavoriteView" class="nav-link active">Danh sách yêu thích</RouterLink>
                <RouterLink to="/donhang" class="nav-link">Đơn hàng</RouterLink>
                <RouterLink to="/postlist" class="nav-link">Trang chủ</RouterLink>
            </nav>
        </aside>
        <main class="content-area">
            <div class="container py-5">
                <h3 class="fw-bold text-center mb-4 text-danger">Danh sách yêu thích</h3>

                <div v-if="favorites.length > 0" class="row">
                    <div v-for="item in favorites" :key="item.id" class="col-md-3 col-sm-6 mb-4">
                        <div class="card h-100 shadow-sm border-0 text-center">
                            <img :src="item.image" class="card-img-top p-3" style="height:220px; object-fit:contain;" />
                            <div class="card-body">
                                <h6 class="fw-bold">{{ item.title }}</h6>
                                <p class="text-danger fw-bold">{{ item.price }} USD</p>
                                <button class="btn btn-outline-danger btn-sm"
                                    @click="removeFavorite(item.id)">Xóa</button>
                                <button @click="goTo(item.id)" class="btn btn-outline-danger btn-sm">
                                    Xem chi tiết
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div v-else class="text-center text-muted mt-5">
                    <p>Hiện chưa có sản phẩm yêu thích nào </p>
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
}
</style>
