import { createWebHistory, createRouter } from 'vue-router'
import ListPostView from './pages/Listpost.vue'
import PostDetailView from './pages/postdetail.vue'
import NotFound from './components/NotFound.vue'
import Login from './lab4/login.vue'
import PostList from "./lab4/postlist.vue";
// import Profile from './components/Profile.vue'
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
  { path: '/', name: 'Home', component: PostList, meta: { isAuth: false } },
  { path: '/posts', name: 'Posts', component: ListPostView, meta: { isAuth: false } },
  { path: '/posts/:id', name: 'PostDetail', component: PostDetailView, meta: { isAuth: false } },
  { path: '/login', name: 'Login', component: Login, meta: { isAuth: false } },
  // { path: '/profile', name: 'Profile', component: Profile, meta: { isAuth: true } },
  { path: '/postlist', name: 'PostList', component: PostList, meta: { isAuth: true } },
  { path: '/products/:id', component: ProductDetail, props: true },
  { path: '/register', component: Register },
  { path: '/admin', component: admin },
  { path: '/profile', component: Profile },
  { path: '/danhmuc', name: 'DanhMuc', component: DanhMuc },
  { path: '/cart', name: 'Cart', component: Cart },
  { path: "/products", name: "Products", component: Products },
  { path: "/quanliuser", name: "Quanliuser", component: quanliuser },
  { path: "/payment", name: "Payment", component: payment },
  { path: "/paymentSuccess", name: "PaymentSuccess", component: paymentSuccess },
  { path: "/paymentFailed", name: "PaymentFailed", component: paymentFailed },
  { path: "/donhang", name: "Donhang", component: donhang },
  { path: "/FavoriteView", name: "FavoriteView", component: FavoriteView },
  { path: '/orderAdmin', name: 'OrderAdmin', component: orderAdmin },
  { path: '/thongke', name: 'Thongke', component: thongke },
  // { path: '/vnpay_return', name: 'VNPayReturn', component: () => import('./lab4/vnpay_return.vue') },

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
 * check permission
 */
router.beforeEach((to, from, next) => {
  const currentUser = localStorage.getItem('currentUser');
  if (to.meta.isAuth) {
    if (currentUser) {
      const user = JSON.parse(currentUser);
      if (!user.role) {
        return next({ name: 'Login' });
      }
    } else {
      return next({ name: 'Login' });
    }
  }
  next();
});

export default router
