import { createRouter, createWebHistory } from 'vue-router'
import FamilyTree from '@/components/FamilyTree.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: FamilyTree,
    },
  ],
})

export default router
