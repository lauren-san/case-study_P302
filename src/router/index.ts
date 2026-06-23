import { createRouter, createWebHistory } from 'vue-router'
import CollectionView from '../views/CollectionView.vue'
import GeneratorView from '../views/GeneratorView.vue'
import LibraryView from '../views/LibraryView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'collection',
      component: CollectionView,
    },
    {
      path: '/generator',
      name: 'generator',
      component: GeneratorView,
    },
    {
      path: '/library',
      name: 'library',
      component: LibraryView,
    },
  ],
})

export default router
