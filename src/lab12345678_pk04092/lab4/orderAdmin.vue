<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import axios from "axios";

const orders = ref([]);
const selectedOrder = ref(null);
async function loadAllOrders() {
  try {
    const res = await axios.get("http://localhost:3000/orders");
    orders.value = res.data
      .slice()
      .sort((a, b) => {
        const ta = a.id || new Date(a.date).getTime();
        const tb = b.id || new Date(b.date).getTime();
        return tb - ta;
      });
  } catch (err) {
    console.error("Lỗi khi tải đơn hàng từ server:", err);
  }
}

onMounted(() => {
  loadAllOrders();
  window.addEventListener("storage", loadAllOrders);
});

onBeforeUnmount(() => {
  window.removeEventListener("storage", loadAllOrders);
});

const updateStatus = async (id, status) => {
  const idx = orders.value.findIndex((o) => o.id == id);
  if (idx === -1) return;

  orders.value[idx].status = status;
  const order = { ...orders.value[idx] };
  try {
    const res = await axios.get(`http://localhost:3000/orders/${String(id)}`);
    if (!res.data) {
      alert("Không tìm thấy đơn hàng trên server!");
      return;
    }
    const updatedOrder = { ...res.data, status };
    await axios.put(`http://localhost:3000/orders/${String(id)}`, updatedOrder);
    if (status === "Hoàn thành") {
      await reduceStockFromOrder(order);
    }
    alert("Trạng thái đơn hàng đã được lưu!");
    await loadAllOrders();
  } catch (e) {
    console.error("Lỗi khi cập nhật trạng thái đơn hàng:", e);
    alert("Không thể lưu thay đổi lên server!");
  }
};


const reduceStockFromOrder = async (order) => {
  try {
    const res = await axios.get("http://localhost:3000/products");
    const products = res.data;
    for (const item of order.items) {
      const product = products.find((p) => p.id === item.id);
      if (product) {
        const newStock = Math.max((product.stock ?? 0) - item.quantity, 0);
        await axios.patch(`http://localhost:3000/products/${product.id}`, {
          stock: newStock,
        });
        console.log(`Đã trừ ${item.quantity} khỏi ${product.title} → còn ${newStock}`);
      }
    }
    console.log("Đã cập nhật tồn kho trong JSON Server!");
  } catch (err) {
    console.error("Lỗi khi trừ tồn kho:", err);
  }
};

const deleteOrder = async (id) => {
  if (!confirm("Bạn có chắc muốn xóa đơn hàng này không?")) return;

  try {
    await axios.delete(`http://localhost:3000/orders/${id}`);
    console.log(`Đã xóa đơn ${id} trên server`);
    loadAllOrders();
    alert("Đã xóa đơn hàng!");
  } catch (e) {
    console.warn("Không tìm thấy đơn trong db.json, bỏ qua.");
  }
};

const viewOrder = (order) => {
  selectedOrder.value = order;
};
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
      <h2>Quản lý đơn hàng</h2>

      <div class="card table-card">
        <div class="table-header">
          <h5>Danh sách đơn hàng</h5>
          <span class="count">{{ orders.length }} đơn</span>
        </div>

        <div class="table-container">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Khách hàng (email)</th>
                <th>Tổng tiền</th>
                <th class="col-status">Trạng thái</th>
                <th>Ngày đặt</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="order in orders" :key="order.id">
                <td>{{ order.id }}</td>
                <td>{{ order.email || order._ownerEmail || 'guest' }}</td>
                <td class="price">{{ order.total_amount?.toLocaleString() }} đ</td>
                <td>
                  <select v-model="order.status" class="form-select status-select" :disabled="order.status === 'Đã hủy'"
                    @change="updateStatus(order.id, order.status)">

                    <option>Đặt hàng (COD)</option>
                    <option>Đang xử lý</option>
                    <option>Đang giao hàng</option>
                    <option>Hoàn thành</option>
                    <option>Đã hủy</option>
                    <option>Đang chờ thanh toán VNPay</option>
                  </select>
                </td>
                <td>{{ order.date }}</td>
                <td>
                  <button class="btn-view" @click="viewOrder(order)">Xem</button>
                  <button class="btn-delete" @click="deleteOrder(order.id)">Xóa</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <div v-if="selectedOrder" class="card detail-card">
        <h5>Chi tiết đơn hàng #{{ selectedOrder.id }}</h5>
        <p><strong>Khách hàng:</strong> {{ selectedOrder.name }}</p>
        <p><strong>SĐT:</strong> {{ selectedOrder.phone }}</p>
        <p><strong>Email:</strong> {{ selectedOrder.email }}</p>
        <p>
          <strong>Địa chỉ:</strong>
          {{ selectedOrder.address?.ward }}, {{ selectedOrder.address?.district }}, {{ selectedOrder.address?.province
          }}
        </p>
        <p><strong>Ghi chú:</strong> {{ selectedOrder.note || "(Không có)" }}</p>

        <h6>Sản phẩm:</h6>
        <ul class="list-group">
          <li v-for="item in selectedOrder.items" :key="item.id" class="list-group-item">
            <span>{{ item.title }} × {{ item.quantity }}</span>
            <strong>{{ (item.price * item.quantity).toLocaleString() }} đ</strong>
          </li>
        </ul>

        <p><strong>Phí ship:</strong> {{ selectedOrder.shipping_fee?.toLocaleString() }} đ</p>
        <p class="text-total">Tổng tiền: {{ selectedOrder.total_amount?.toLocaleString() }} đ</p>

        <button class="btn-close" @click="selectedOrder = null">Đóng</button>
      </div>
    </main>
  </div>
</template>

<style scoped></style>


<style scoped>
.admin-wrapper {
  display: flex;
  min-height: 100vh;
  background: #f7f9fc;
  color: #333;
  font-family: "Inter", sans-serif;
}

.sidebar {
  width: 230px;
  background: #fff;
  border-right: 1px solid #e0e4ee;
  padding: 30px 20px;
  display: flex;
  flex-direction: column;
  box-shadow: 2px 0 8px rgba(0, 0, 0, 0.03);
}

.sidebar h3 {
  font-weight: 700;
  color: #2e59d9;
  text-align: center;
  margin-bottom: 25px;
}

.sidebar nav {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.sidebar a {
  text-decoration: none;
  padding: 10px 15px;
  border-radius: 8px;
  font-weight: 500;
  color: #444;
  transition: 0.25s;
}

.sidebar a:hover,
.sidebar a.active {
  background-color: #2e59d9;
  color: white;
}

.main-content {
  flex: 1;
  padding: 40px 50px;
}

.main-content h2 {
  color: #2e59d9;
  font-weight: 700;
  margin-bottom: 25px;
}

.card {
  background: white;
  border-radius: 14px;
  padding: 25px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  margin-bottom: 25px;
  transition: 0.3s ease;
}

.card:hover {
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.06);
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
  min-width: 950px;
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

.col-status {
  width: 240px;
}

.price {
  color: #e74a3b;
  font-weight: 600;
}

.status-select {
  width: 100%;
  min-width: 220px;
  border-radius: 8px;
  padding: 7px 10px;
  border: 1px solid #d0d7e2;
  background-color: white;
  font-size: 14px;
  white-space: normal;
  overflow: visible;
}

.status-select:focus {
  outline: none;
  border-color: #4e73df;
  box-shadow: 0 0 0 3px rgba(78, 115, 223, 0.15);
}

.btn-view,
.btn-delete,
.btn-close {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  white-space: nowrap;
  padding: 8px 14px;
  min-width: 40px;
  line-height: 1;
  border: none;
  border-radius: 8px;
  background: #e9ecf5;
  color: #333;
  cursor: pointer;
  font-weight: 400;
}

.btn-close:hover {
  background: #dfe3f0;
}

.btn,
.btn-view,
.btn-delete {
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
}

.detail-card,
.detail-card * {
  word-break: normal !important;
  overflow-wrap: normal !important;
}

.btn-view {
  background: #4e73df;
  color: white;
}

.btn-view:hover {
  background: #3650c0;
}

.btn-delete {
  background: #e74a3b;
  color: white;
}

.btn-delete:hover {
  background: #c92c3a;
}

.btn-close {
  background: #e9ecf5;
  color: #333;
  margin-top: 10px;
}

.btn-close:hover {
  background: #dfe3f0;
}

.detail-card {
  max-width: 600px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 3px 12px rgba(0, 0, 0, 0.05);
}

.detail-card h5 {
  color: #2e59d9;
  font-weight: 600;
  margin-bottom: 10px;
}

.list-group {
  list-style: none;
  padding: 0;
  margin: 10px 0;
  border: 1px solid #ebedf3;
  border-radius: 10px;
}

.list-group-item {
  display: flex;
  justify-content: space-between;
  padding: 10px 14px;
  border-bottom: 1px solid #ebedf3;
  background: #fdfdff;
}

.list-group-item:last-child {
  border-bottom: none;
}

.text-total {
  font-weight: 700;
  color: #e74a3b;
  margin-top: 10px;
}
</style>
