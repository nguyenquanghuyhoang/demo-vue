<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import axios from "axios";

const router = useRouter();
const store = useStore();
const myOrders = ref([]);
const selectedOrder = ref(null);
async function loadOrdersForCurrentUser() {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user || !user.email) {
    myOrders.value = [];
    return;
  }
  try {
    const res = await axios.get("http://localhost:3000/orders");
    const dbOrders = res.data.filter((o) => o.email === user.email);
    myOrders.value = dbOrders.slice().sort((a, b) => {
      const ta = a.id || new Date(a.date).getTime();
      const tb = b.id || new Date(b.date).getTime();
      return tb - ta;
    });
  } catch (err) {
    console.error("Lỗi khi tải đơn hàng từ db.json:", err);
    myOrders.value = [];
  }
}
const cancelOrder = async (order) => {
  const confirmCancel = confirm("Bạn có chắc muốn hủy đơn hàng này?");
  if (!confirmCancel) return;
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user || !user.email) return;
  try {
    const res = await axios.get(`http://localhost:3000/orders/${order.id}`);
    if (!res.data) {
      alert("Không tìm thấy đơn hàng trên server!");
      return;
    }
    await axios.patch(`http://localhost:3000/orders/${order.id}`, {
      ...res.data,
      status: "Đã hủy",
    });

    alert("Đơn hàng đã được hủy thành công!");
    await loadOrdersForCurrentUser();
    selectedOrder.value = null;
  } catch (err) {
    console.error("Lỗi khi cập nhật trạng thái đơn hàng:", err);
    alert("Không thể hủy đơn hàng trên server (db.json).");
  }
};
const reorder = (order) => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user || !user.username) {
    alert("Vui lòng đăng nhập để mua lại sản phẩm!");
    router.push("/login");
    return;
  }

  store.dispatch("clearCart");

  order.items.forEach((item) => {
    store.state.cart.push({
      id: item.id,
      title: item.title,
      price: item.price,
      quantity: item.quantity,
      image: item.image || "",
    });
  });

  localStorage.setItem(
    `cart_${user.username}`,
    JSON.stringify(store.state.cart)
  );

  alert("Đã thêm sản phẩm từ đơn hàng vào giỏ hàng! Chuyển sang giỏ hàng...");
  router.push("/cart");
};

const viewOrder = (order) => {
  selectedOrder.value = order;
};
onMounted(async () => {
  await loadOrdersForCurrentUser();
  window.addEventListener("storage", loadOrdersForCurrentUser);

  const urlParams = new URLSearchParams(window.location.search);
  const vnp_ResponseCode = urlParams.get("vnp_ResponseCode");
  const vnp_TxnRef = urlParams.get("vnp_TxnRef"); 

  if (vnp_ResponseCode === "00" && vnp_TxnRef) {
    try {
      await axios.patch(`http://localhost:3000/orders/${vnp_TxnRef}`, {
        status: "Đã thanh toán VNPay",
      });
      alert("Thanh toán VNPay thành công! Đơn hàng đã được cập nhật.");
      await loadOrdersForCurrentUser();
    } catch (err) {
      console.warn("Không thể cập nhật trạng thái VNPay lên db.json:", err);
    }

    window.history.replaceState({}, document.title, window.location.pathname);
  }
});

onBeforeUnmount(() => {
  window.removeEventListener("storage", loadOrdersForCurrentUser);
});
</script>



<template>
  <div class="user-wrapper">
    <aside class="sidebar">
      <h3>Người dùng</h3>
      <nav>
        <RouterLink to="/profile" class="nav-link">Hồ sơ</RouterLink>
        <RouterLink to="/FavoriteView" class="nav-link">Danh sách yêu thích</RouterLink>
        <RouterLink to="/donhang" class="nav-link active">Đơn hàng</RouterLink>
        <RouterLink to="/postlist" class="nav-link">Trang chủ</RouterLink>
      </nav>
    </aside>

    <main class="main-content">
      <h3 class="title">Đơn hàng của tôi</h3>

      <div v-if="myOrders.length > 0" class="order-container">
        <table class="order-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Ngày đặt</th>
              <th>Tổng tiền</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in myOrders" :key="order.id">
              <td>{{ order.id }}</td>
              <td>{{ order.date }}</td>
              <td class="price">{{ order.total_amount.toLocaleString() }} đ</td>
              <td>
                <span :class="{
                  'text-warning': order.status?.toLowerCase().includes('chờ'),
                  'text-success': order.status?.toLowerCase().includes('hoàn'),
                  'text-danger': order.status?.toLowerCase().includes('hủy'),
                  'text-primary': order.status?.toLowerCase().includes('đang'),
                }">{{ order.status }}</span>
              </td>
              <td class="actions">
                <button class="btn-view" @click="viewOrder(order)">Xem chi tiết</button>
                <button v-if="order.status?.toLowerCase().includes('hoàn')" class="btn-reorder" @click="reorder(order)">
                  Mua lại
                </button>
                <button v-if="order.status &&
                  (order.status.toLowerCase().includes('chờ') ||
                    order.status.toLowerCase().includes('đang') ||
                    order.status.toLowerCase().includes('đặt'))" class="btn-cancel" @click="cancelOrder(order)">
                  Hủy đơn
                </button>

              </td>
            </tr>
          </tbody>
        </table>

        <div v-if="selectedOrder" class="order-detail">
          <h5 class="fw-bold text-success mb-3">Chi tiết đơn hàng #{{ selectedOrder.id }}</h5>
          <p><strong>Ngày đặt:</strong> {{ selectedOrder.date }}</p>
          <p><strong>Địa chỉ:</strong>
            {{ selectedOrder.address.ward }}, {{ selectedOrder.address.district }}, {{ selectedOrder.address.province }}
          </p>
          <p><strong>Phương thức thanh toán:</strong> {{ (selectedOrder.payment_method || "").toUpperCase() }}</p>

          <h6 class="text-primary fw-bold">Danh sách sản phẩm:</h6>
          <ul class="product-list">
            <li v-for="item in selectedOrder.items" :key="item.id">
              <span>{{ item.title }} × {{ item.quantity }}</span>
              <strong>{{ (item.price * item.quantity).toLocaleString() }} đ</strong>
            </li>
          </ul>

          <p><strong>Phí ship:</strong> {{ selectedOrder.shipping_fee?.toLocaleString() }} đ</p>
          <p class="total">Tổng tiền: {{ selectedOrder.total_amount?.toLocaleString() }} đ</p>
          <button class="btn-close" @click="selectedOrder = null">Đóng</button>
        </div>
      </div>

      <div v-else class="no-orders">
        <p>Hiện bạn chưa có đơn hàng nào.</p>
        <router-link to="/" class="btn-shop">Mua sắm ngay</router-link>
      </div>
    </main>
  </div>
</template>

<style scoped>
.user-wrapper {
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

.main-content {
  flex: 1;
  padding: 3rem;
}

.title {
  color: #007bff;
  font-weight: 700;
  margin-bottom: 25px;
}

.order-container {
  background: #fff;
  border-radius: 16px;
  padding: 25px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.06);
}

.order-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 20px;
}

.order-table th,
.order-table td {
  padding: 12px 14px;
  text-align: left;
  border-bottom: 1px solid #e0e4ef;
  white-space: nowrap;
}

.order-table th {
  background: #f8f9fa;
  font-weight: 600;
  color: #333;
}

.order-table tr:hover {
  background: #f9fbff;
}

.price {
  color: #e74a3b;
  font-weight: 600;
}

.actions {
  display: flex;
  gap: 8px;
}

.btn-view,
.btn-reorder,
.btn-cancel {
  border: none;
  border-radius: 6px;
  padding: 6px 10px;
  color: white;
  cursor: pointer;
  transition: 0.2s;
}

.btn-view {
  background: #007bff;
}

.btn-view:hover {
  background: #0056d2;
}

.btn-reorder {
  background: #28a745;
}

.btn-reorder:hover {
  background: #218838;
}

.btn-cancel {
  background: #dc3545;
}

.btn-cancel:hover {
  background: #c82333;
}

.order-detail {
  margin-top: 30px;
  background: #f9fafc;
  padding: 20px;
  border-radius: 12px;
  box-shadow: inset 0 0 5px rgba(0, 0, 0, 0.05);
}

.order-detail ul {
  list-style: none;
  padding: 0;
  margin: 10px 0;
  border: 1px solid #e0e4ef;
  border-radius: 8px;
}

.order-detail li {
  display: flex;
  justify-content: space-between;
  padding: 10px 14px;
  border-bottom: 1px solid #e0e4ef;
}

.order-detail li:last-child {
  border-bottom: none;
}

.total {
  font-weight: 700;
  color: #e74a3b;
}

.btn-close {
  margin-top: 10px;
  background: #dee3f0;
  border: none;
  border-radius: 8px;
  padding: 8px 16px;
  font-weight: 500;
  cursor: pointer;
}

.btn-close:hover {
  background: #cfd6e8;
}

.no-orders {
  text-align: center;
  background: #fff;
  padding: 40px;
  border-radius: 16px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
}

.btn-shop {
  margin-top: 10px;
  background: #007bff;
  color: #fff;
  border-radius: 8px;
  padding: 10px 20px;
  text-decoration: none;
  display: inline-block;
}

.btn-shop:hover {
  background: #0056d2;
}
</style>
