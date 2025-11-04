import { createWebHistory, createRouter } from 'vue-router'
import ListPostView from './pages/Listpost.vue'
import PostDetailView from './pages/postdetail.vue'
import NotFound from './components/NotFound.vue'
import Login from './lab4/login.vue'
import PostList from "./lab4/postlist.vue";
import ProductDetail from './lab4/ProductDetail.vue'
import Register from './lab4/Register.vue'
import admin from './lab4/admin.vue'
import Profile from './lab4/profile.vue'
import DanhMuc from './lab4/danhmuc.vue'
import Cart from './lab4/Cart.vue'
import Products from "./lab4/product.vue"
import quanliuser from './lab4/quanliuser.vue'
import payment from './lab4/payment.vue'
import paymentSuccess from './lab4/paymentSuccess.vue'
import paymentFailed from './lab4/paymentFailed.vue'
import donhang from './lab4/donhang.vue'
import FavoriteView from './lab4/FavoriteView.vue'
import orderAdmin from './lab4/orderAdmin.vue'
import thongke from './lab4/thongke.vue'

const routes = [
  { path: '/', name: 'Home', component: PostList, meta: { isAuth: true } },
  { path: '/posts', name: 'Posts', component: ListPostView, meta: { isAuth: false } },
  { path: '/posts/:id', name: 'PostDetail', component: PostDetailView, meta: { isAuth: false } },
  { path: '/login', name: 'Login', component: Login, meta: { isAuth: false } },
  { path: '/register', name: 'Register', component: Register, meta: { isAuth: false } },

  // Người dùng bình thường
  { path: '/postlist', name: 'PostList', component: PostList, meta: { isAuth: true, role: ['user', 'admin'] } },
  { path: '/products/:id', component: ProductDetail, props: true, meta: { isAuth: true, role: ['user', 'admin'] } },
  { path: '/profile', name: 'Profile', component: Profile, meta: { isAuth: true, role: ['user', 'admin'] } },
  { path: '/danhmuc', name: 'DanhMuc', component: DanhMuc, meta: { isAuth: true, role: ['user', 'admin'] } },
  { path: '/cart', name: 'Cart', component: Cart, meta: { isAuth: true, role: ['user', 'admin'] } },
  { path: "/products", name: "Products", component: Products, meta: { isAuth: true, role: ['user', 'admin'] } },
  { path: "/payment", name: "Payment", component: payment, meta: { isAuth: true, role: ['user', 'admin'] } },
  { path: "/paymentSuccess", name: "PaymentSuccess", component: paymentSuccess, meta: { isAuth: true, role: ['user', 'admin'] } },
  { path: "/paymentFailed", name: "PaymentFailed", component: paymentFailed, meta: { isAuth: true, role: ['user', 'admin'] } },
  { path: "/donhang", name: "Donhang", component: donhang, meta: { isAuth: true, role: ['user', 'admin'] } },
  { path: "/FavoriteView", name: "FavoriteView", component: FavoriteView, meta: { isAuth: true, role: ['user', 'admin'] } },

  // Admin routes
  { path: '/admin', name: 'Admin', component: admin, meta: { isAuth: true, role: ['admin'] } },
  { path: "/quanliuser", name: "Quanliuser", component: quanliuser, meta: { isAuth: true, role: ['admin'] } },
  { path: '/orderAdmin', name: 'OrderAdmin', component: orderAdmin, meta: { isAuth: true, role: ['admin'] } },
  { path: '/thongke', name: 'Thongke', component: thongke, meta: { isAuth: true, role: ['admin'] } },

  // 404
  {
    path: '/:pathMatch(.*)*',
    name: 'NotFound',
    component: NotFound,
    meta: { isAuth: false }
  },
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

/**
 * 🧠 Kiểm tra quyền truy cập
 */
router.beforeEach((to, from, next) => {
  const user = JSON.parse(localStorage.getItem('user'))

  // Nếu đã đăng nhập mà cố vào /login → chuyển về trang chủ
  if (user && to.name === 'Login') {
    return next({ name: 'PostList' })
  }

  // Nếu route cần đăng nhập mà chưa có user → quay về login
  // if (to.meta.isAuth && !user) {
  //   alert('Vui lòng đăng nhập để tiếp tục!')
  //   return next({ name: 'Login' })
  // }

  // Nếu route có quy định role và user không phù hợp → chặn
  if (to.meta.role && user) {
    const roles = to.meta.role
    if (!roles.includes(user.role)) {
      alert('Bạn không có quyền truy cập trang này!')
      return next({ name: 'PostList' })
    }
  }

  next()
})

export default router
