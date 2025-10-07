<script setup>
import { ref } from 'vue'
const message = ref("bạn chưa có tin nhắn")
const dem = ref(0)
const tuoi = ref(0)
/**
 * props ->
 * ref
 * reactive -> state 
 */
const changeMessage = () => {
    message.value = "đã đổi thông tin"
}

const handleTang = () => {
    tuoi.value++
}

const handleGiam = () => {
    tuoi.value--
}
/**
 * cấp 1, cấp 2, cấp 3, 
 * 11, 11-15, 15-18 cấp 3, >18  đã tốt nghiệp
 */

</script>
<template>
    <h1>Hiện thị tin nhắn</h1>
    <p>{{ message }}</p>
    <p class="dem">{{ dem }}|{{ tuoi }}</p>
    <button @click="changeMessage">thay đổi thông báo</button>
    <button @click="handleTang">tăng số</button>
    <button @click="handleGiam">giảm</button>
    <hr />
    <!--điều kiện -->
    <p v-if="tuoi < 12">học cấp 1</p>
    <p v-else-if="tuoi < 16">học cấp 2</p>
    <p v-else-if="tuoi < 19">học cấp 3</p>
    <p v-else>đã tốt nghiệp</p>
    <div v-show="tuoi > 19">
        <img src="https://image.luatvietnam.vn/uploaded/665twebp/images/original/2023/11/29/bang-tot-nghiep-dai-hoc2_2911151850.jpg"
            width="300" />
    </div>





</template>
<style scoped>
.dem {
    font-size: 40px;
    font-weight: bold;
    color: red;
    text-align: center;
}
</style>