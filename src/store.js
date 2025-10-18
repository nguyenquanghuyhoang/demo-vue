// 📁 store/index.js
import { createStore } from "vuex";

const store = createStore({
  state() {
    return {
      user: null,
      cart: [],
    };
  },

  getters: {
    cartItems: (state) => state.cart,
    cartTotal: (state) =>
      state.cart.reduce((total, item) => total + item.price * item.quantity, 0),
    currentUser: (state) => state.user,
  },

  mutations: {
    // ✅ Đăng nhập / đăng xuất
    setUser(state, user) {
      if (user) {
        // 🔹 Lấy giỏ hàng user riêng (nếu có)
        const userCart =
          JSON.parse(localStorage.getItem(`cart_${user.username}`)) || [];

        // 🔹 Lấy giỏ guest (chỉ gộp 1 lần đầu login)
        const guestCart =
          JSON.parse(localStorage.getItem("cart") || "[]") || [];

        const mergedCart =
          guestCart.length > 0
            ? [
                ...userCart,
                ...guestCart.filter(
                  (g) => !userCart.some((u) => u.id === g.id)
                ),
              ]
            : userCart;

        // ✅ Cập nhật state
        state.user = user;
        state.cart = mergedCart;

        // ✅ Lưu giỏ hàng user
        localStorage.setItem(
          `cart_${user.username}`,
          JSON.stringify(mergedCart)
        );

        // ✅ Xóa giỏ guest (chỉ khi đã merge)
        if (guestCart.length > 0) localStorage.removeItem("cart");

        // ✅ Lưu user
        localStorage.setItem("user", JSON.stringify(user));
      } else {
        // 🏁 Khi đăng xuất
        if (state.user) {
          // Lưu lại giỏ của user hiện tại
          localStorage.setItem(
            `cart_${state.user.username}`,
            JSON.stringify(state.cart)
          );
        }

        // Xóa user ra khỏi localStorage
        localStorage.removeItem("user");
        state.user = null;

        // Không đụng đến giỏ guest
      }
    },

    // ✅ Thêm sản phẩm vào giỏ
    ADD_TO_CART(state, product) {
      const existing = state.cart.find((item) => item.id === product.id);
      if (existing) existing.quantity++;
      else state.cart.push({ ...product, quantity: 1 });

      // Lưu lại theo user / guest
      if (state.user) {
        localStorage.setItem(
          `cart_${state.user.username}`,
          JSON.stringify(state.cart)
        );
      } else {
        localStorage.setItem("cart", JSON.stringify(state.cart));
      }
    },

    // ✅ Xóa sản phẩm
    REMOVE_FROM_CART(state, id) {
      state.cart = state.cart.filter((item) => item.id !== id);
      if (state.user) {
        localStorage.setItem(
          `cart_${state.user.username}`,
          JSON.stringify(state.cart)
        );
      } else {
        localStorage.setItem("cart", JSON.stringify(state.cart));
      }
    },

    // ✅ Tăng số lượng
    INCREASE_QTY(state, id) {
      const item = state.cart.find((i) => i.id === id);
      if (item) item.quantity++;
      if (state.user) {
        localStorage.setItem(
          `cart_${state.user.username}`,
          JSON.stringify(state.cart)
        );
      } else {
        localStorage.setItem("cart", JSON.stringify(state.cart));
      }
    },

    // ✅ Giảm số lượng
    DECREASE_QTY(state, id) {
      const item = state.cart.find((i) => i.id === id);
      if (item && item.quantity > 1) item.quantity--;
      if (state.user) {
        localStorage.setItem(
          `cart_${state.user.username}`,
          JSON.stringify(state.cart)
        );
      } else {
        localStorage.setItem("cart", JSON.stringify(state.cart));
      }
    },

    // ✅ Xóa toàn bộ giỏ
    CLEAR_CART(state) {
      state.cart = [];
      if (state.user) {
        localStorage.setItem(`cart_${state.user.username}`, JSON.stringify([]));
      } else {
        localStorage.removeItem("cart");
      }
    },
  },

  actions: {
    setUser({ commit }, user) {
      commit("setUser", user);
    },
    addToCart({ commit }, product) {
      commit("ADD_TO_CART", product);
    },
    removeFromCart({ commit }, id) {
      commit("REMOVE_FROM_CART", id);
    },
    increaseQty({ commit }, id) {
      commit("INCREASE_QTY", id);
    },
    decreaseQty({ commit }, id) {
      commit("DECREASE_QTY", id);
    },
    clearCart({ commit }) {
      commit("CLEAR_CART");
    },
  },
});

// 🧩 Khôi phục user & giỏ hàng khi reload
const savedUser = JSON.parse(localStorage.getItem("user"));
if (savedUser) {
  store.state.user = savedUser;

  const userCart =
    JSON.parse(localStorage.getItem(`cart_${savedUser.username}`)) || [];

  store.state.cart = userCart;
} else {
  const guestCart = JSON.parse(localStorage.getItem("cart")) || [];
  store.state.cart = guestCart;
}

export default store;
