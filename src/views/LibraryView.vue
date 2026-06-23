<script setup lang="ts">
import { reactive } from 'vue'
import { useStudio } from '../composables/useStudio'

const studio = useStudio()
const uploadOpen = reactive<Record<string, boolean>>({})
const uploadStatus = reactive<Record<string, string>>({})
const fileInputs = reactive<Record<string, HTMLInputElement | null>>({})

function toggleUpload(id: string) {
  uploadOpen[id] = !uploadOpen[id]
  uploadStatus[id] = uploadOpen[id] ? 'Choose an image file from your device, then save it.' : ''
}

async function saveUpload(id: string) {
  const input = fileInputs[id]
  const file = input?.files?.[0]
  if (!file) {
    uploadStatus[id] = 'Choose an image file first.'
    return
  }
  try {
    uploadStatus[id] = 'Saving image...'
    await studio.saveDesignImage(id, file)
    uploadStatus[id] = ''
    uploadOpen[id] = false
    if (input) input.value = ''
  } catch (error) {
    uploadStatus[id] = error instanceof Error ? error.message : "Couldn't save that image."
  }
}

function cancelUpload(id: string) {
  uploadOpen[id] = false
  uploadStatus[id] = ''
  const input = fileInputs[id]
  if (input) input.value = ''
}

function removeImage(id: string) {
  studio.clearDesignImage(id)
  uploadStatus[id] = ''
  uploadOpen[id] = false
}

function confirmDelete(id: string) {
  if (!window.confirm('Delete this saved design?')) return
  studio.deleteDesign(id)
}
</script>

<template>
  <section id="content" class="card section-shell" aria-labelledby="library-title">
    <div class="section-head">
      <h2 id="library-title">Saved Designs</h2>
      <div class="inline-controls">
        <label>
          Status
          <select v-model="studio.state.designFilters.status">
            <option value="all">All</option>
            <option value="tried">Tried</option>
            <option value="untried">Not tried</option>
          </select>
        </label>
        <label>
          Uses favorites
          <select v-model="studio.state.designFilters.favorite">
            <option value="all">All designs</option>
            <option value="favoritesOnly">With favorite polish</option>
          </select>
        </label>
      </div>
    </div>

    <div class="design-library" role="list">
      <p v-if="!studio.filteredDesigns.value.length" class="muted">No saved designs match this filter yet.</p>
      <article v-for="design in studio.filteredDesigns.value" :key="design.id" class="design-card" role="listitem">
        <div class="design-card-head">
          <h3>{{ studio.designTitle(design) }}</h3>
          <span class="design-status-badge" :class="design.tried ? 'is-tried' : 'is-untried'">{{ design.tried ? 'Tried' : 'Not Tried' }}</span>
        </div>
        <div class="design-card-swatches">
          <span v-for="polishId in design.polishIds" :key="polishId" class="design-dot" :style="{ background: studio.state.polishes.find((polish) => polish.id === polishId)?.color || '#ccc' }" :title="studio.state.polishes.find((polish) => polish.id === polishId)?.name"></span>
        </div>
        <div v-if="design.imageUrl" class="design-image-wrap">
          <img :src="design.imageUrl" :alt="studio.designTitle(design)" class="design-image" />
        </div>
        <p>{{ design.description }}</p>
        <p><strong>Polishes:</strong> {{ studio.polishNames(design.polishIds) }}</p>
        <p><strong>Saved:</strong> {{ studio.formatDate(design.createdAt) }}</p>

        <div class="design-image-editor">
          <div class="inline-controls design-image-actions">
            <button class="btn btn-secondary small" type="button" @click="toggleUpload(design.id)">{{ design.imageUrl ? 'Update Image' : 'Add Image' }}</button>
            <button class="btn btn-secondary small" type="button" :disabled="!design.imageUrl" @click="removeImage(design.id)">Remove Image</button>
          </div>
          <div v-if="uploadOpen[design.id]" class="design-upload-panel">
            <label class="design-upload-label">
              Upload Image
              <input :ref="(el) => { fileInputs[design.id] = el as HTMLInputElement | null }" type="file" accept="image/*" />
            </label>
            <div class="inline-controls design-upload-actions">
              <button class="btn btn-secondary small" type="button" @click="saveUpload(design.id)">Save Upload</button>
              <button class="btn btn-secondary small" type="button" @click="cancelUpload(design.id)">Cancel</button>
            </div>
            <p class="design-upload-status muted">{{ uploadStatus[design.id] }}</p>
          </div>
        </div>

        <div class="inline-controls design-card-actions">
          <button class="btn btn-secondary small" type="button" @click="studio.toggleDesignTried(design.id)">Mark as {{ design.tried ? 'Not Tried' : 'Tried' }}</button>
          <button class="btn btn-danger small" type="button" @click="confirmDelete(design.id)">Delete</button>
        </div>
      </article>
    </div>
  </section>
</template>
