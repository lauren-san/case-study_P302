<script setup lang="ts">
import { computed, onMounted } from 'vue'
import { RouterLink, RouterView, useRoute } from 'vue-router'

const route = useRoute()

const subtitle = computed(() => {
  if (route.name === 'collection') return 'Manage your collection, filter, and switch views.'
  if (route.name === 'generator') return 'Create looks from your collection, then track what you loved.'
  return "Browse saved ideas and track which designs you've already tried."
})

onMounted(() => {
  document.body.classList.add('hero-page')
})
</script>

<template>
  <div class="hero-page">
    <main class="layout simple-layout">
      <section class="hero hero-full" aria-labelledby="hero-title">
        <h1 id="hero-title" class="hero-title">Polished</h1>
        <p class="subtitle hero-subtitle">{{ subtitle }}</p>
        <nav class="main-nav hero-nav" aria-label="Main menu">
          <RouterLink class="nav-link" exact-active-class="active" to="/">My Collection</RouterLink>
          <RouterLink class="nav-link" exact-active-class="active" to="/generator">Nail Art Generator</RouterLink>
          <RouterLink class="nav-link" exact-active-class="active" to="/library">Design Library</RouterLink>
        </nav>
        <div class="hero-bottles" aria-hidden="true">
          <svg class="hero-bottle" style="left:5%;top:22%;transform:rotate(-14deg)" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 112">
            <ellipse cx="26" cy="107" rx="20" ry="4" fill="rgba(0,0,0,0.18)"/>
            <rect x="3" y="50" width="46" height="56" rx="12" fill="#e63946"/>
            <rect x="9" y="56" width="10" height="42" rx="5" fill="rgba(255,255,255,0.28)"/>
            <rect x="15" y="2" width="22" height="50" rx="3" fill="#1a1a1a"/>
            <rect x="19" y="6" width="5" height="30" rx="2" fill="rgba(255,255,255,0.12)"/>
          </svg>
          <svg class="hero-bottle" style="left:13%;top:62%;transform:rotate(10deg)" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 112">
            <ellipse cx="26" cy="107" rx="20" ry="4" fill="rgba(0,0,0,0.18)"/>
            <rect x="3" y="50" width="46" height="56" rx="12" fill="#d63384"/>
            <rect x="9" y="56" width="10" height="42" rx="5" fill="rgba(255,255,255,0.28)"/>
            <rect x="15" y="2" width="22" height="50" rx="3" fill="#1a1a1a"/>
            <rect x="19" y="6" width="5" height="30" rx="2" fill="rgba(255,255,255,0.12)"/>
          </svg>
          <svg class="hero-bottle" style="right:5%;top:20%;transform:rotate(13deg)" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 112">
            <ellipse cx="26" cy="107" rx="20" ry="4" fill="rgba(0,0,0,0.18)"/>
            <rect x="3" y="50" width="46" height="56" rx="12" fill="#ff6b6b"/>
            <rect x="9" y="56" width="10" height="42" rx="5" fill="rgba(255,255,255,0.28)"/>
            <rect x="15" y="2" width="22" height="50" rx="3" fill="#1a1a1a"/>
            <rect x="19" y="6" width="5" height="30" rx="2" fill="rgba(255,255,255,0.12)"/>
          </svg>
          <svg class="hero-bottle" style="right:14%;top:60%;transform:rotate(-8deg)" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 112">
            <ellipse cx="26" cy="107" rx="20" ry="4" fill="rgba(0,0,0,0.18)"/>
            <rect x="3" y="50" width="46" height="56" rx="12" fill="#a855f7"/>
            <rect x="9" y="56" width="10" height="42" rx="5" fill="rgba(255,255,255,0.28)"/>
            <rect x="15" y="2" width="22" height="50" rx="3" fill="#1a1a1a"/>
            <rect x="19" y="6" width="5" height="30" rx="2" fill="rgba(255,255,255,0.12)"/>
          </svg>
        </div>
      </section>

      <RouterView />
    </main>
  </div>
</template>
