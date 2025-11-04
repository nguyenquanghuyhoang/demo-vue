<script setup>
import { ref, onMounted, onBeforeUnmount, watch, computed } from "vue";

import { useStore } from "vuex";
import { useRouter } from "vue-router";
import axios from "axios";
import { VNPay, ignoreLogger } from "vnpay";

const store = useStore();
const router = useRouter();
const API_KEY = "2068e364-a962-11f0-8a8c-d60461a34742";
const idShop = "6063478";
const provinces = ref();
const province_id = ref("");
const districts = ref();
const district_id = ref("");
const wards = ref();
const ward_id = ref("");
const tinhphi = ref();
const tinhphiship = ref("");
const errors = ref({});

const thanhtoan = async () => {
  const user = JSON.parse(localStorage.getItem("user"));
  if (!user || !user.email) {
    alert("Vui lòng đăng nhập trước khi thanh toán VNPay!");
    return;
  }

  const order_id = Math.floor(Math.random() * 1000000000000) + 1;

  const orderData = {
    id: order_id,
    email: user.email,
    date: new Date().toLocaleString(),
    total_amount: cartTotal.value + phiship.value.service_fee,
    items: cartItems.value,
    status: "Hoàn thành",
  };

  const ordersKey = `orders_${user.email}`;
  const orders = JSON.parse(localStorage.getItem(ordersKey)) || [];
  orders.push(orderData);
  localStorage.setItem(ordersKey, JSON.stringify(orders));
  localStorage.setItem("lastOrderId", order_id);

  try {
    const response = await axios.post("http://localhost/vnpay/createPayment.php", {
      order_id,
      amount: cartTotal.value + phiship.value.service_fee,
    });

    if (response.data) {
      window.location.href = response.data;
    } else {
      alert("Không thể tạo liên kết thanh toán VNPay!");
    }
  } catch (error) {
    console.error("Lỗi khi tạo thanh toán VNPay:", error);
    alert("Có lỗi xảy ra khi kết nối với máy chủ VNPay.");
  }
};


const phiship = ref({
  total: 0,
  service_fee: 0,
  insurance_fee: 0,
  deliver_remote_areas_fee: 0,
});

const loadPhi = async () => {
  const response = await axios.get(`https://online-gateway.ghn.vn/shiip/public-api/v2/shipping-order/fee`, {
    headers: {
      "Content-Type": "application/json",
      Token: API_KEY,
      ShopId: idShop,
    },
    params: {
      service_type_id: 2,
      to_district_id: parseInt(district_id.value),
      to_ward_code: ward_id.value,
      length: 30,
      width: 40,
      height: 20,
      weight: 3000,
      insurance_value: 0,
      coupon: null,
    },
  });
  tinhphi.value = response.data.data;
  Object.assign(phiship.value, response.data.data);
};
const loadXa = async () => {
  const response = await axios.get(
    `https://online-gateway.ghn.vn/shiip/public-api/master-data/ward?district_id=${district_id.value}`,
    {
      headers: {
        "Content-Type": "application/json",
        Token: API_KEY,
      },
    }
  );
  wards.value = response.data.data;
};
const loadQuan = async () => {
  const response = await axios.get(
    `https://online-gateway.ghn.vn/shiip/public-api/master-data/district?province_id=${province_id.value}`,
    {
      headers: {
        "Content-Type": "application/json",
        Token: API_KEY,
      },
    }
  );
  districts.value = response.data.data;
};
const loadTinh = async () => {
  const response = await axios.get(`https://online-gateway.ghn.vn/shiip/public-api/master-data/province`, {
    headers: {
      "Content-Type": "application/json",
      Token: API_KEY,
    },
  });
  provinces.value = response.data.data;
};
const cartItems = computed(() => store.getters.cartItems);
const cartTotal = computed(() => store.getters.cartTotal);
const increaseQty = (id) => {
  const item = cartItems.value.find(i => i.id === id);
  if (item) {
    if (item.quantity < item.stock) {
      store.dispatch("increaseQty", id);
    } else {
      alert(`Sản phẩm "${item.title}" chỉ còn ${item.stock} sản phẩm trong kho.`);
    }
  }
};

const decreaseQty = (id) => store.dispatch("decreaseQty", id);
const removeFromCart = (id) => store.dispatch("removeFromCart", id);
const clearCart = () => store.dispatch("clearCart");

const goBackToProducts = () => router.push("/");
const showCheckout = ref(false);
const checkoutForm = ref({
  name: "",
  phone: "",
  email: "",
  address: "",
  note: "",
});
checkoutForm.value.paymentMethod = "cod";
const validateForm = () => {
  errors.value = {};
  if (!checkoutForm.value.name.trim()) errors.value.name = "Vui lòng nhập họ và tên";
  if (!checkoutForm.value.phone.trim()) errors.value.phone = "Vui lòng nhập số điện thoại";
  else if (!/^(0\d{9,10})$/.test(checkoutForm.value.phone))
    errors.value.phone = "Số điện thoại không hợp lệ";
  if (!checkoutForm.value.email.trim()) errors.value.email = "Vui lòng nhập email";
  else if (!/\S+@\S+\.\S+/.test(checkoutForm.value.email))
    errors.value.email = "Email không hợp lệ";
  if (!province_id.value) errors.value.province = "Vui lòng chọn tỉnh/thành phố";
  if (!district_id.value) errors.value.district = "Vui lòng chọn quận/huyện";
  if (!ward_id.value) errors.value.ward = "Vui lòng chọn xã/phường";
  return Object.keys(errors.value).length === 0;
};

const updateProductStock = async () => {
  try {
    const res = await axios.get("http://localhost:3000/products");
    const products = res.data;

    for (const cartItem of cartItems.value) {
      const product = products.find((p) => p.id === cartItem.id);
      if (product) {
        const newStock = Math.max((product.stock ?? 0) - cartItem.quantity, 0);
        await axios.patch(`http://localhost:3000/products/${product.id}`, {
          stock: newStock,
        });
        console.log(`Đã trừ ${cartItem.quantity} khỏi ${product.title} → còn ${newStock}`);
      }
    }

    console.log("Cập nhật tồn kho thành công trong JSON Server!");
  } catch (error) {
    console.error("Lỗi khi cập nhật tồn kho:", error);
  }
};


const xacNhanThanhToan = async () => {
  if (!validateForm()) {
    alert("Vui lòng nhập đầy đủ thông tin trước khi thanh toán!");
    return;
  }

  const newOrder = {
    id: String(Date.now()),
    name: checkoutForm.value.name,
    phone: checkoutForm.value.phone,
    email: checkoutForm.value.email,
    address: {
      province: provinces.value.find(p => p.ProvinceID === province_id.value)?.ProvinceName || '',
      district: districts.value.find(d => d.DistrictID === district_id.value)?.DistrictName || '',
      ward: wards.value.find(w => w.WardCode === ward_id.value)?.WardName || '',
    },
    note: checkoutForm.value.note,
    items: cartItems.value,
    total: cartTotal.value,
    shipping_fee: phiship.value.service_fee,
    total_amount: cartTotal.value + phiship.value.service_fee,
    payment_method: checkoutForm.value.paymentMethod,
    status: checkoutForm.value.paymentMethod === "vnpay"
      ? "Hoàn thành"
      : "Đặt hàng (COD)",
    date: new Date().toLocaleString("vi-VN"),
  };

  const user = JSON.parse(localStorage.getItem("user"));
  if (user && user.email) {
    const userOrdersKey = `orders_${user.email}`;
    const existingOrders = JSON.parse(localStorage.getItem(userOrdersKey)) || [];
    existingOrders.push(newOrder);
    localStorage.setItem(userOrdersKey, JSON.stringify(existingOrders));
  } else {
    const guestOrders = JSON.parse(localStorage.getItem("guest_orders")) || [];
    guestOrders.push(newOrder);
    localStorage.setItem("guest_orders", JSON.stringify(guestOrders));
  }

  try {
    await axios.post("http://localhost:3000/orders", newOrder);
    console.log("Đơn hàng đã được lưu vào db.json!");
  } catch (err) {
    console.error("Lỗi khi lưu đơn hàng vào db.json:", err);
  }

  await updateProductStock();

  if (checkoutForm.value.paymentMethod === "vnpay") {
    thanhtoan();
  } else {
    alert("Đặt hàng thành công! Thanh toán khi nhận hàng.");
    clearCart();
    const user = JSON.parse(localStorage.getItem("user"));
    const cartKey = user && user.email ? `cart_${user.email}` : "cart";
    localStorage.setItem(cartKey, JSON.stringify([]));

    router.push("/donhang");
  }
};

watch(
  () => store.getters.cartItems,
  (newCart) => {
    const user = JSON.parse(localStorage.getItem("user"));
    const cartKey = user && user.email ? `cart_${user.email}` : "cart";
    localStorage.setItem(cartKey, JSON.stringify(newCart));
  },
  { deep: true }
);
onMounted(() => {
  loadTinh();
  const user = JSON.parse(localStorage.getItem("user"));
  const cartKey = user && user.email ? `cart_${user.email}` : "cart";
  const savedCart = JSON.parse(localStorage.getItem(cartKey) || "[]");

  if (savedCart.length > 0) {
    savedCart.forEach((item) => store.commit("addToCart", item));
  }
});
</script>
<template>
  <header class="main-header">
    <div class="nav-container">
      <div class="left-nav">
        <div class="logo" @click="$router.push('/')">
          <span class="logo-text">Hoangsellclothes</span>
        </div>

        <nav class="nav-links">
          <RouterLink to="/" class="nav-item" active-class="active">Trang chủ</RouterLink>
          <RouterLink to="/products" class="nav-item" active-class="active">Sản phẩm</RouterLink>
        </nav>
      </div>


    </div>
  </header>

  <div class="container py-5">
    <h3 class="fw-bold mb-4 text-center text-primary">Giỏ hàng của bạn</h3>

    <div v-if="cartItems.length > 0">
      <table class="table table-hover align-middle">
        <thead>
          <tr>
            <th>Ảnh</th>
            <th>Tên sản phẩm</th>
            <th>Giá</th>
            <th>Số lượng</th>
            <th>Tổng</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="item in cartItems" :key="item.id">
            <td><img :src="item.image" width="60" class="rounded" /></td>
            <td>{{ item.title }}</td>
            <td>{{ item.price }} đ</td>
            <td>
              <div class="d-flex align-items-center gap-2">
                <button class="btn btn-sm btn-outline-secondary" @click="decreaseQty(item.id)">-</button>
                <span>{{ item.quantity }}</span>
                <button class="btn btn-sm btn-outline-secondary" @click="increaseQty(item.id)">+</button>
              </div>
            </td>
            <td class="fw-bold text-success">{{ item.price * item.quantity }} đ</td>
            <td><button class="btn btn-sm btn-danger" @click="removeFromCart(item.id)">Xóa</button></td>
          </tr>
        </tbody>
      </table>
      <div class="mt-5 p-4 bg-light rounded shadow-sm payment-form">
        <h5 class="fw-bold mb-3 text-success">Thông tin thanh toán</h5>

        <div class="row g-3">
          <div class="col-md-6">
            <label class="form-label">Họ và tên *</label>
            <input v-model="checkoutForm.name" type="text" class="form-control" placeholder="Nhập họ và tên" />
            <small v-if="errors.name" class="text-danger">{{ errors.name }}</small>

            <label class="form-label mt-3">Số điện thoại *</label>
            <input v-model="checkoutForm.phone" type="text" class="form-control" placeholder="Nhập số điện thoại" />
            <small v-if="errors.phone" class="text-danger">{{ errors.phone }}</small>
          </div>
          <div class="col-md-6">
            <label class="form-label">Địa chỉ nhận hàng *</label>
            <div class="row g-2">
              <div class="col-12 col-md-4">
                <select @change="loadQuan()" v-model="province_id" class="form-select">
                  <option value="">-- Tỉnh/Thành phố --</option>
                  <option v-for="province in provinces" :key="province.ProvinceID" :value="province.ProvinceID">
                    {{ province.ProvinceName }}
                  </option>
                </select>
                <small v-if="errors.province" class="text-danger">{{ errors.province }}</small>
              </div>
              <div class="col-12 col-md-4">
                <select v-model="district_id" @change="loadXa()" :disabled="province_id == ''" class="form-select">
                  <option value="">-- Quận/Huyện --</option>
                  <option v-for="district in districts" :key="district.DistrictID" :value="district.DistrictID">
                    {{ district.DistrictName }}
                  </option>
                </select>
                <small v-if="errors.district" class="text-danger">{{ errors.district }}</small>
              </div>
              <div class="col-12 col-md-4">
                <select v-model="ward_id" @change="loadPhi()" :disabled="district_id == ''" class="form-select">
                  <option value="">-- Xã/Phường --</option>
                  <option v-for="ward in wards" :key="ward.WardCode" :value="ward.WardCode">
                    {{ ward.WardName }}
                  </option>
                </select>
                <small v-if="errors.ward" class="text-danger">{{ errors.ward }}</small>
              </div>
            </div>

            <label class="form-label mt-3">Email *</label>
            <input v-model="checkoutForm.email" type="email" class="form-control" placeholder="Nhập email" />
            <small v-if="errors.email" class="text-danger">{{ errors.email }}</small>
          </div>
          <div class="col-12">
            <label class="form-label mt-3">Ghi chú đơn hàng</label>
            <textarea v-model="checkoutForm.note" class="form-control" rows="3"
              placeholder="Nhập ghi chú (nếu có)"></textarea>
          </div>
        </div>
      </div>
      <div v-if="phiship.total > 0" class="col-12 mt-3">
        <div class="border rounded p-3 bg-white">
          <h6 class="fw-bold text-primary mb-2">Tổng thanh toán</h6>
          <ul class="list-unstyled mb-0">
            <li>Tổng giỏ hàng: <strong>{{ cartTotal.toLocaleString() }} đ</strong></li>
            <li>Phí ship: <strong>{{ phiship.service_fee.toLocaleString() }} đ</strong></li>
            <li class="mt-2 border-top pt-2">
              <strong class="text-danger fs-5">
                Tổng thanh toán: {{ (cartTotal + phiship.service_fee).toLocaleString() }} đ
              </strong>
            </li>
          </ul>
        </div>
      </div>

      <div class="col-12 mt-3">
        <label class="form-label fw-bold text-success">Phương thức thanh toán *</label>
        <div class="d-flex flex-wrap gap-3">
          <div class="form-check">
            <input class="form-check-input" type="radio" id="cod" value="cod" v-model="checkoutForm.paymentMethod" />
            <label class="form-check-label" for="cod">Thanh toán khi nhận hàng (COD)</label>
          </div>
          <div class="form-check">
            <input class="form-check-input" type="radio" id="vnpay" value="vnpay"
              v-model="checkoutForm.paymentMethod" />
            <label class="form-check-label" for="vnpay">Thanh toán qua VNPay</label>
          </div>
        </div>
      </div>
      <div class="col-12 text-end d-flex justify-content-end gap-2 mt-3">
        <button class="btn btn-primary px-4" type="button" @click="xacNhanThanhToan">Xác nhận thanh toán</button>
      </div>


    </div>
  </div>
</template>


<style scoped>
table img {
  object-fit: cover;
}

.btn {
  border-radius: 8px;
  transition: all 0.2s ease-in-out;
}

.btn:hover {
  transform: translateY(-1px);
}

.bg-light {
  background-color: #f8f9fa !important;
}

.payment-form {
  border: 1px solid #dfe6e9;
  background: #f8f9fa;
  border-radius: 12px;
  transition: all 0.3s ease;
}

.payment-form:hover {
  box-shadow: 0 0 10px rgba(40, 167, 69, 0.2);
}

.payment-form h5 {
  font-size: 1.3rem;
  border-left: 4px solid #28a745;
  padding-left: 10px;
  color: #28a745;
}

.payment-form .form-label {
  font-weight: 600;
  color: #2d3436;
  font-size: 0.95rem;
}

.payment-form .form-control,
.payment-form .form-select {
  border-radius: 10px;
  border: 1px solid #ced4da;
  padding: 10px 12px;
  transition: all 0.2s ease;
}

.payment-form .form-control:focus,
.payment-form .form-select:focus {
  border-color: #28a745;
  box-shadow: 0 0 0 0.15rem rgba(40, 167, 69, 0.25);
}

.payment-form .row.g-2>div {
  flex: 1;
}

@media (max-width: 768px) {
  .payment-form .row.g-3>div {
    width: 100%;
  }

  .payment-form .row.g-2>div {
    width: 100%;
  }
}

.main-header {
  background: linear-gradient(90deg, #007bff, #00b4ff);
  padding: 15px 40px;
  color: white;
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
}

.nav-container {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.left-nav {
  display: flex;
  align-items: center;
  gap: 25px;
}

.logo-text {
  font-weight: 700;
  font-size: 1.3rem;
  background: rgba(255, 255, 255, 0.2);
  padding: 8px 15px;
  border-radius: 8px;
  color: #fff;
  cursor: pointer;
}

.nav-links {
  display: flex;
  gap: 20px;
}

.nav-item {
  color: white;
  text-decoration: none;
  padding: 8px 14px;
  border-radius: 8px;
  transition: 0.2s;
}

.nav-item.active,
.nav-item:hover {
  background: rgba(255, 255, 255, 0.2);
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 15px;
}

.btn-outline {
  border: 1px solid white;
  background: transparent;
  color: white;
  padding: 6px 14px;
  border-radius: 8px;
  text-decoration: none;
  transition: 0.2s;
}

.btn-outline:hover {
  background: rgba(255, 255, 255, 0.15);
}

.user-dropdown {
  position: relative;
}

.dropdown-btn {
  border: 1px solid white;
  background: transparent;
  color: white;
  padding: 6px 14px;
  border-radius: 8px;
  cursor: pointer;
}

.dropdown-menu {
  position: absolute;
  top: 42px;
  right: 0;
  background: white;
  color: #333;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  display: none;
  flex-direction: column;
  min-width: 150px;
}

.user-dropdown:hover .dropdown-menu {
  display: flex;
}

.dropdown-item {
  padding: 10px 14px;
  text-decoration: none;
  color: #333;
  transition: 0.2s;
  text-align: left;
  background: white;
  border: none;
}

.dropdown-item:hover {
  background: #f5f5f5;
}

.logout {
  color: red;
}
</style>
