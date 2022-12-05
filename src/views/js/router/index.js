import Vue from 'vue'
import VueRouter from 'vue-router'
import Base from '@/views/Base.vue'
import Login from '@/widgets/Login/login.vue'

Vue.use(VueRouter)

const routes = [{
//   path: '/',
//   name: 'login',
//   component: Login,
//   children: []
// },{
  path: '/',
  name: 'base',
  component: Base,
  children: []
},{
  path: '/login',
  name: 'Login',
  component: Login,
  children: []
},{
  path: '*',
  name: 'base',
  component: Base,
  children: []
},]

const router = new VueRouter({
  // mode: 'history',
  base: process.env.BASE_URL,
  routes
})

const routerPush = VueRouter.prototype.push
VueRouter.prototype.push = function push(location) {
  return routerPush.call(this, location).catch(error => error)
}

export default router