<script setup>
import { onMounted } from "vue";
import { useStore } from "vuex";
import axios from "axios";

const store = useStore();
const updateProductStock = async () => {
  const cartItems = store.getters.cartItems;
  for (const cartItem of cartItems) {
    try {
      const response = await axios.get(`http://localhost:3000/products/${cartItem.id}`);
      const currentProduct = response.data;
      const newStock = Math.max(0, currentProduct.stock - cartItem.quantity);
      await axios.patch(`http://localhost:3000/products/${cartItem.id}`, { stock: newStock });
      console.log(`Cập nhật tồn kho ${currentProduct.title}: còn ${newStock}`);
    } catch (error) {
      console.error(`Lỗi cập nhật tồn kho cho ${cartItem.title}:`, error);
    }
  }

  try {
    await axios.get(`http://localhost:3000/products?_t=${Date.now()}`);
    console.log("Dữ liệu sản phẩm đã được reload sau khi trừ tồn kho");
  } catch (reloadErr) {
    console.error("Lỗi reload dữ liệu sau khi trừ tồn kho:", reloadErr);
  }
};

onMounted(async () => {
  try {
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user || !user.email) {
      console.warn("Không có thông tin người dùng, không thể lưu đơn hàng!");
      return;
    }

    const orderData = {
      id: Date.now(),
      email: user.email,
      date: new Date().toLocaleString(),
      total_amount: store.getters.cartTotal,
      items: store.getters.cartItems,
      payment_method: "VNPay",
      status: "Hoàn thành",
      address: JSON.parse(localStorage.getItem("shipping_address") || "{}"),
    };
    await axios.post("http://localhost/vnpay/saveOrder.php", {
      email: orderData.email,
      total_amount: orderData.total_amount,
      items: JSON.stringify(orderData.items),
      status: orderData.status,
      payment_method: orderData.payment_method,
    });
    const key = `orders_${user.email}`;
    const existingOrders = JSON.parse(localStorage.getItem(key) || "[]");
    existingOrders.push(orderData);
    localStorage.setItem(key, JSON.stringify(existingOrders));

    await updateProductStock();
    store.dispatch("clearCart");

    console.log(" Thanh toán VNPay thành công, đơn hàng đã được lưu & tồn kho cập nhật!");
  } catch (error) {
    console.error("Lỗi khi lưu đơn hàng hoặc cập nhật tồn kho:", error);
  }
});
</script>

<template>
  <div class="container py-5 text-center">
    <h2 class="text-success fw-bold mb-3">Thanh toán VNPay thành công!</h2>
    <p class="mb-4">Cảm ơn bạn đã mua hàng tại <strong>Hoangsellclothes</strong>.</p>
    <router-link to="/donhang" class="btn btn-primary me-2">
      Xem đơn hàng của tôi
    </router-link>
    <router-link to="/" class="btn btn-outline-primary">
      Về trang chủ
    </router-link>
  </div>
</template>
