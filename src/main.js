import { createApp } from 'vue'
// import App from './kiemtra/productslist.vue'
// import App from './pages/Listpost.vue'
// import App from './post.vue'
// import App from './perant.vue'
// import App from './login.vue'
import App from './App.vue'
// import App from './cvthongtin.vue'
// import App from './lab4/login.vue'
import router from './rounter';
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap/dist/js/bootstrap.bundle.min.js'
import store from './store';
createApp(App).use(store).use(router).mount('#app')