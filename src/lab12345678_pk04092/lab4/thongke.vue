<script setup>
import { ref, computed, onMounted } from 'vue'
const orders = ref([])
function loadAllOrders() {
  const allKeys = Object.keys(localStorage)
  const allOrders = []

  allKeys.forEach((key) => {
    if (key.startsWith('orders_')) {
      try {
        const userOrders = JSON.parse(localStorage.getItem(key)) || []
        const ownerEmail = key.replace(/^orders_/, '')
        userOrders.forEach((o) => allOrders.push({ ...o, _ownerEmail: ownerEmail }))
      } catch (e) {
        console.error('Parse error:', key, e)
      }
    }

    if (key === 'guest_orders') {
      const guest = JSON.parse(localStorage.getItem('guest_orders') || '[]')
      guest.forEach((o) => allOrders.push({ ...o, _ownerEmail: 'guest' }))
    }
  })

  orders.value = allOrders
}
const summaryStats = computed(() => {
  let totalRevenue = 0
  let totalOrders = orders.value.length
  let totalProductsSold = 0

  orders.value.forEach((order) => {
    totalRevenue += order.total_amount || 0
    if (order.items) {
      order.items.forEach((item) => {
        totalProductsSold += item.quantity
      })
    }
  })
  const products = JSON.parse(localStorage.getItem('products') || '[]')
  const totalStock = products.reduce((acc, p) => acc + (p.stock || 0), 0)

  return {
    totalRevenue,
    totalOrders,
    totalStock,
    totalProductsSold
  }
})
const customerStats = computed(() => {
  const statsMap = {}

  orders.value.forEach((order) => {
    const email = order.email || order._ownerEmail || 'guest'
    const name = order.name || 'Chưa có tên'

    if (!statsMap[email]) {
      statsMap[email] = {
        email,
        name,
        totalSpent: 0,
        orderCount: 0
      }
    }

    statsMap[email].totalSpent += order.total_amount || 0
    statsMap[email].orderCount += 1
  })

  return Object.values(statsMap).sort((a, b) => b.totalSpent - a.totalSpent)
})
const topProducts = computed(() => {
  const productStats = {}

  orders.value.forEach((order) => {
    if (!order.items) return
    order.items.forEach((item) => {
      if (!productStats[item.id]) {
        productStats[item.id] = {
          id: item.id,
          title: item.title,
          image: item.image,
          totalSold: 0,
          totalRevenue: 0
        }
      }
      productStats[item.id].totalSold += item.quantity
      productStats[item.id].totalRevenue += item.price * item.quantity
    })
  })

  return Object.values(productStats)
    .sort((a, b) => b.totalSold - a.totalSold)
    .slice(0, 5)
})

onMounted(() => {
  loadAllOrders()
})
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
      <h2 class="page-title">Thống kê Admin</h2>
      <div class="summary-cards">
        <div class="summary-card">
          <h5>Tổng doanh thu</h5>
          <p>{{ summaryStats.totalRevenue.toLocaleString() }} đ</p>
        </div>
        <div class="summary-card">
          <h5>Tổng đơn hàng</h5>
          <p>{{ summaryStats.totalOrders }}</p>
        </div>
        <div class="summary-card">
          <h5>Tổng sản phẩm còn hàng</h5>
          <p>{{ summaryStats.totalStock }}</p>
        </div>
        <div class="summary-card">
          <h5>Sản phẩm đã bán (tổng)</h5>
          <p>{{ summaryStats.totalProductsSold }}</p>
        </div>
      </div>
      <h2>Thống kê khách hàng</h2>
      <div class="card table-card">
        <div class="table-header">
          <h5>Danh sách khách hàng</h5>
          <span class="count">{{ customerStats.length }} khách hàng</span>
        </div>

        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>Tên khách hàng</th>
                <th>Email</th>
                <th>Số đơn hàng</th>
                <th>Tổng chi tiêu</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="customer in customerStats" :key="customer.email">
                <td>{{ customer.name }}</td>
                <td>{{ customer.email }}</td>
                <td>{{ customer.orderCount }}</td>
                <td class="price">{{ customer.totalSpent.toLocaleString() }} đ</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
      <h2>Top 5 sản phẩm bán chạy</h2>
      <div class="card table-card">
        <div class="table-header">
          <h5>Top 5 sản phẩm bán chạy nhất</h5>
          <span class="count">{{ topProducts.length }} sản phẩm</span>
        </div>

        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>Ảnh</th>
                <th>Tên sản phẩm</th>
                <th>Số lượng đã bán</th>
                <th>Tổng doanh thu</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(p, index) in topProducts" :key="p.id">
                <td><img :src="p.image" alt="" class="thumb" /></td>
                <td><strong>{{ index + 1 }}. {{ p.title }}</strong></td>
                <td>{{ p.totalSold }}</td>
                <td class="price">{{ p.totalRevenue.toLocaleString() }} đ</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>
  </div>
</template>

<style scoped>
.admin-wrapper {
  display: flex;
  min-height: 100vh;
  font-family: 'Inter', sans-serif;
  background: #f6f8fc;
  color: #333;
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
  background: #f7f9fc;
}
.page-title {
  color: #2e59d9;
  font-weight: 700;
  margin-bottom: 25px;
}

.summary-cards {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 20px;
  margin-bottom: 40px;
}
.summary-card {
  flex: 1;
  min-width: 220px;
  background: #fff;
  border-radius: 12px;
  padding: 20px;
  text-align: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  transition: all 0.25s ease;
}
.summary-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
}
.summary-card h5 {
  font-weight: 600;
  color: #555;
  margin-bottom: 8px;
}
.summary-card p {
  font-size: 22px;
  font-weight: 700;
  color: #2e59d9;
}

/* Table */
.card {
  background: white;
  border-radius: 14px;
  padding: 25px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  margin-bottom: 25px;
}
.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.table-header h5 {
  color: #2e59d9;
  font-weight: 600;
}
.count {
  background: #edf1ff;
  color: #2e59d9;
  padding: 5px 12px;
  border-radius: 10px;
  font-weight: 500;
}
.table-container {
  overflow-x: auto;
}
table {
  width: 100%;
  border-collapse: collapse;
  min-width: 700px;
  font-size: 15px;
}
th,
td {
  padding: 10px 12px;
  border-bottom: 1px solid #e6e9f3;
  text-align: left;
  vertical-align: middle;
  white-space: nowrap;
}
th {
  background: #f3f6ff;
  font-weight: 600;
  color: #2e59d9;
}
tr:hover {
  background: #f9fbff;
}
.price {
  color: #e74a3b;
  font-weight: 600;
}
.thumb {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 8px;
}
</style>
