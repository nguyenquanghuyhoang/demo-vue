<script setup>
import { onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useStore } from "vuex";
import axios from "axios";

const route = useRoute();
const router = useRouter();
const store = useStore();

onMounted(async () => {
  const responseCode = route.query.vnp_ResponseCode;
  let txnRef = route.query.vnp_TxnRef;
  if (!txnRef) {
    txnRef = localStorage.getItem("lastOrderId");
  }
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user || !user.email || !txnRef) {
    alert("Không thể xác định đơn hàng hoặc người dùng.");
    router.push("/cart");
    return;
  }

  if (responseCode === "00") {
    try {
      await axios.post("http://localhost/vnpay/saveOrder.php", {
        email: user.email,
        status: "Hoàn thành",
        transaction_id: txnRef,
      });
      const ordersKey = `orders_${user.email}`;
      const orders = JSON.parse(localStorage.getItem(ordersKey)) || [];
      const updatedOrders = orders.map((order) =>
        order.id == txnRef ? { ...order, status: "Hoàn thành" } : order
      );
      localStorage.setItem(ordersKey, JSON.stringify(updatedOrders));
      store.dispatch("clearCart");
      localStorage.removeItem("lastOrderId");

      alert("Thanh toán VNPay thành công!");
      router.push("/donhang");
    } catch (error) {
      console.error("Lỗi khi cập nhật đơn hàng:", error);
      alert("Có lỗi khi cập nhật trạng thái đơn hàng.");
      router.push("/donhang");
    }
  } else {
    alert("Thanh toán thất bại hoặc bị hủy.");
    router.push("/cart");
  }
});
</script>

<template>
  <div class="text-center py-5">
    <h2>Đang xử lý kết quả thanh toán...</h2>
  </div>
</template>
