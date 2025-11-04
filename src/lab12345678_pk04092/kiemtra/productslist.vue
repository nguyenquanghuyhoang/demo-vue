<script setup>
import { ref, onMounted, reactive } from 'vue'
import axios from 'axios'

const products = ref([])
const product = reactive({
  title: '',
  price: '',
  image: '',
  category: '',
  description: ''
})

onMounted(async () => {
  Loadulieu()
})

const handleDelete = async (id) => {
  const isConfirm = confirm(`bạn có muốn xoá id = ${id} này không ?`)
  if (isConfirm) {
    const response = await axios.delete(`http://localhost:3000/products/${id}`);
    if (response.status == 200) {
      Loadulieu()
      alert('xoá thành công')
    }
  }
}

const Loadulieu = async () => {
  console.log(`the component is now mounted.`)
  const response = await axios.get('http://localhost:3000/products');
  if (response.status == 200) {
    products.value = response.data
  }
}

const handleSubmit = async () => {
  if (product.title === "") {
    alert('title không để trống')
    return
  }
  const payload = {
    title: product.title,
    price: product.price,
    image: product.image,
    category: product.category,
    description: product.description
  }
  const response = await axios.post('http://localhost:3000/products', payload)
  console.log(response)
  if (response.status == 201) {
    Loadulieu()
    clearData()
    alert('đã thêm thành công')
  }
}

const clearData = () => {
  Object.assign(product, {
    title: '',
    price: '',
    image: '',
    category: '',
    description: ''
  })
}
</script>

<template>
  <header class="py-4 bg-white border-bottom mb-4">
    <div class="container d-flex align-items-center justify-content-between">
      <h1 class="h4 mb-0">MyShop</h1>
      <a class="btn btn-primary" href="#editForm">Add / Edit Product</a>
    </div>
  </header>

  <main class="container pb-5">
    <div class="row g-4">
      <!-- Products list -->
      <section class="col-lg-8">
        <div class="card shadow-sm">
          <div class="card-header d-flex justify-content-between align-items-center">
            <span class="fw-semibold">Products</span>
            <small class="text-secondary">Dynamic list with Vue</small>
          </div>
          <div class="card-body p-0">
            <div class="table-responsive">
              <table class="table table-hover align-middle mb-0">
                <thead class="table-light">
                  <tr>
                    <th style="width:80px">Image</th>
                    <th>Title</th>
                    <th style="width:140px">Category</th>
                    <th style="width:120px" class="text-end">Price</th>
                    <th style="width:160px" class="text-end">Action</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="item in products" :key="item.id">
                    <td>
                      <img class="product-thumb" :src="item.image" alt="product" style="width:60px;height:60px;object-fit:cover;">
                    </td>
                    <td>{{ item.title }}</td>
                    <td><span class="badge text-bg-dark">{{ item.category }}</span></td>
                    <td class="text-end">{{ item.price }}</td>
                    <td class="text-end">
                      <a href="#editForm" class="btn btn-sm btn-outline-secondary">Edit</a>
                      <button @click="handleDelete(item.id)" class="btn btn-sm btn-outline-danger">Delete</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </section>

      <!-- Edit form -->
      <aside class="col-lg-4">
        <div class="card shadow-sm sticky-col" id="editForm">
          <div class="card-header">Edit Product</div>
          <div class="card-body">
            <!-- Sửa ở đây -->
            <form @submit.prevent="handleSubmit">
              <div class="mb-3">
                <label for="pTitle" class="form-label">Title</label>
                <input v-model="product.title" type="text" class="form-control" id="pTitle" placeholder="Product title" required>
              </div>
              <div class="mb-3">
                <label for="pPrice" class="form-label">Price (USD)</label>
                <input v-model="product.price" type="number" class="form-control" id="pPrice" step="0.01" min="0" placeholder="0.00" required>
              </div>
              <div class="mb-3">
                <label for="pCategory" class="form-label">Category</label>
                <select v-model="product.category" id="pCategory" class="form-select" required>
                  <option value="" disabled>Choose...</option>
                  <option>Electronics</option>
                  <option>Home</option>
                  <option>Fashion</option>
                  <option>Sports</option>
                </select>
              </div>
              <div class="mb-3">
                <label for="pImage" class="form-label">Image URL</label>
                <input v-model="product.image" type="url" class="form-control" id="pImage" placeholder="https://example.com/image.jpg" required>
              </div>
              <div class="mb-3">
                <label for="pDesc" class="form-label">Description</label>
                <textarea v-model="product.description" id="pDesc" class="form-control" rows="3" placeholder="Short product description" required></textarea>
              </div>

              <div class="d-flex gap-2">
                <button type="submit" class="btn btn-primary">Save</button>
                <button type="reset" class="btn btn-outline-secondary">Reset</button>
              </div>
            </form>
          </div>
        </div>
      </aside>
    </div>
  </main>

  <footer class="py-4 bg-dark text-white">
    <div class="container d-flex flex-wrap justify-content-between align-items-center gap-3">
      <span>© <span id="year">2025</span> MyShop</span>
      <a class="btn btn-outline-light btn-sm" href="#top">Back to top</a>
    </div>
  </footer>
</template>
