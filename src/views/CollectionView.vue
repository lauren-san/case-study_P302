<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
import { useStudio } from '../composables/useStudio'

const studio = useStudio()
const panelOpen = ref(false)
const urlStatus = ref('')
const lookingUp = ref(false)

const form = reactive({
  name: '',
  brand: '',
  color: '#e2527d',
  finish: '',
  datePurchased: '',
  imageUrl: '',
})

const filters = studio.state.filters
const items = computed(() => studio.filteredPolishes.value)

function resetForm() {
  form.name = ''
  form.brand = ''
  form.color = '#e2527d'
  form.finish = ''
  form.datePurchased = ''
  form.imageUrl = ''
  urlStatus.value = ''
}

function submitForm() {
  if (!form.name || !form.brand || !form.finish || !form.datePurchased || !form.imageUrl) return
  const duplicate = studio.addPolish({ ...form })
  if (duplicate) {
    window.alert('Possible duplicate: this polish name and brand already exist.')
  }
  resetForm()
  panelOpen.value = false
}

async function lookupPolish() {
  const urlField = (document.getElementById('polishUrlInput') as HTMLInputElement | null)
  const rawUrl = urlField?.value.trim() || ''
  if (!rawUrl) return
  lookingUp.value = true
  urlStatus.value = ''
  try {
    const result = await studio.lookupPolishUrl(rawUrl)
    form.name = result.name || form.name
    form.brand = result.brand || form.brand
    form.finish = result.formula || form.finish
    form.imageUrl = result.imageUrl || form.imageUrl
    urlStatus.value = result.note || 'Fields filled - please verify.'
  } catch {
    urlStatus.value = "Couldn't read that page. Fill in manually."
  } finally {
    lookingUp.value = false
  }
}

function confirmDelete(id: string, name: string, brand: string) {
  if (!window.confirm(`Delete ${name} by ${brand}?`)) return
  studio.deletePolish(id)
}
</script>

<template>
  <section id="content" class="card section-shell" aria-labelledby="manage-title">
    <div class="section-head">
      <h2 id="manage-title">My Collection</h2>
      <div class="inline-controls">
        <button class="btn btn-secondary" type="button" :aria-pressed="studio.state.inventoryView === 'grid'" @click="studio.setInventoryView('grid')">Grid</button>
        <button class="btn btn-secondary" type="button" :aria-pressed="studio.state.inventoryView === 'list'" @click="studio.setInventoryView('list')">List</button>
        <button class="btn btn-primary" type="button" :aria-expanded="panelOpen" @click="panelOpen = !panelOpen">{{ panelOpen ? '✕ Close' : '+ Add Polish' }}</button>
      </div>
    </div>

    <div v-if="panelOpen" class="add-panel">
      <form class="form-grid" @submit.prevent="submitForm">
        <div class="url-lookup">
          <label for="polishUrlInput">Product URL <span class="help-text inline">(paste a link to auto-fill)</span></label>
          <div class="url-input-row">
            <input id="polishUrlInput" type="url" placeholder="https://www.nailpolish.com/..." autocomplete="off" />
            <button class="btn btn-secondary" type="button" @click="lookupPolish">{{ lookingUp ? 'Looking up…' : 'Auto-fill' }}</button>
          </div>
          <p class="url-status" aria-live="polite">{{ urlStatus }}</p>
        </div>

        <label>
          Name
          <input v-model="form.name" type="text" required />
        </label>
        <label>
          Brand
          <input v-model="form.brand" type="text" required />
        </label>
        <label>
          Color
          <input v-model="form.color" type="color" aria-label="Choose polish color" />
        </label>
        <label>
          Formula
          <select v-model="form.finish" required>
            <option value="">Select formula</option>
            <option v-for="finish in studio.finishOptions.value" :key="finish">{{ finish }}</option>
          </select>
        </label>
        <label>
          Date Purchased
          <input v-model="form.datePurchased" type="date" required />
        </label>
        <label>
          Image URL
          <input v-model="form.imageUrl" type="url" placeholder="https://..." required />
        </label>

        <div class="form-actions">
          <button class="btn btn-primary" type="submit">Save Polish</button>
          <button class="btn btn-secondary" type="button" @click="panelOpen = false">Cancel</button>
        </div>
      </form>
    </div>

    <div class="filters" aria-label="Inventory filters">
      <label>
        Search
        <input v-model="filters.search" type="text" placeholder="Name of polish" />
      </label>
      <label>
        Brand
        <select v-model="filters.brand">
          <option value="all">All brands</option>
          <option v-for="brand in studio.brandOptions.value" :key="brand" :value="brand">{{ brand }}</option>
        </select>
      </label>
      <label>
        Color family
        <select v-model="filters.color">
          <option value="all">All colors</option>
          <option value="red">Red</option>
          <option value="orange">Orange</option>
          <option value="yellow">Yellow</option>
          <option value="green">Green</option>
          <option value="blue">Blue</option>
          <option value="purple">Purple</option>
          <option value="pink">Pink</option>
          <option value="neutral">Neutral</option>
        </select>
      </label>
      <label>
        Formula
        <select v-model="filters.finish">
          <option value="all">All formulas</option>
          <option v-for="finish in studio.finishOptions.value" :key="finish" :value="finish">{{ finish }}</option>
        </select>
      </label>
      <label>
        Recently used
        <select v-model="filters.recent">
          <option value="all">Any time</option>
          <option value="7">Last 7 days</option>
          <option value="30">Last 30 days</option>
          <option value="never">Never used</option>
        </select>
      </label>
      <label>
        Sort by
        <select v-model="filters.sortBy">
          <option value="date">Date purchased</option>
          <option value="uses">Most used</option>
          <option value="favorites">Favorites first</option>
        </select>
      </label>
      <label>
        Favorites
        <span class="filter-toggle-row">
          <input class="filter-toggle-input" :checked="filters.favorite === 'favorites'" type="checkbox" @change="filters.favorite = ($event.target as HTMLInputElement).checked ? 'favorites' : 'all'" />
          <span class="filter-toggle-switch" aria-hidden="true"></span>
          <span>Favorites only</span>
        </span>
      </label>
    </div>

    <div class="inventory" :class="studio.state.inventoryView === 'grid' ? 'grid-view' : 'list-view'" role="list">
      <p v-if="!items.length" class="muted">No polishes match this filter yet.</p>
      <article v-for="item in items" :key="item.id" class="polish-card" role="listitem">
        <div class="swatch" :style="{ background: item.color }" aria-hidden="true"></div>
        <div class="polish-body">
          <h3 class="polish-name">{{ item.name }}</h3>
          <p class="polish-meta">{{ item.brand }} | {{ item.finish }} | {{ studio.formatDate(item.datePurchased) }} | {{ studio.inventoryAgeText(item) }}</p>
          <p class="polish-image-wrap">
            <img v-if="item.imageUrl" :src="item.imageUrl" :alt="item.name" class="polish-card-img" />
          </p>
          <p class="polish-usage">Uses: {{ item.uses }}<span v-if="item.lastUsedAt"> | Last used: {{ studio.formatDate(item.lastUsedAt) }}</span></p>
        </div>
        <div class="polish-actions">
          <button class="btn btn-icon favorite-btn" type="button" :aria-pressed="item.favorite" @click="studio.toggleFavorite(item.id)">{{ item.favorite ? '★' : '☆' }}</button>
          <div class="polish-actions-bottom">
            <button class="btn btn-secondary small use-btn" type="button" @click="studio.logUse(item.id)">Log Use</button>
            <button class="btn btn-secondary small remove-use-btn" type="button" :disabled="item.uses === 0" @click="studio.removeUse(item.id)">Remove Use</button>
            <button class="btn btn-danger small delete-btn" type="button" @click="confirmDelete(item.id, item.name, item.brand)">Delete</button>
          </div>
        </div>
      </article>
    </div>
  </section>
</template>
