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

const routes = [
  { path: '/', name: 'Home', component: ListPostView, meta: { isAuth: false } },
  { path: '/posts', name: 'Posts', component: ListPostView, meta: { isAuth: false } },
  { path: '/posts/:id', name: 'PostDetail', component: PostDetailView, meta: { isAuth: false } },
  { path: '/login', name: 'Login', component: Login, meta: { isAuth: false } },
  // { path: '/profile', name: 'Profile', component: Profile, meta: { isAuth: true } },
  { path: '/postlist', name: 'PostList', component: PostList, meta: { isAuth: true } },
  { path: '/products/:id', component: ProductDetail, props: true },
  { path: '/register', component: Register },
  { path: '/admin', component: admin },
  { path: '/profile', component: Profile },
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
