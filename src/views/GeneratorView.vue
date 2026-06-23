<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import { useStudio } from '../composables/useStudio'

const studio = useStudio()
const isDropdownOpen = ref(false)
const dropdownRef = ref<HTMLElement | null>(null)

const pool = computed(() => {
  const selected = new Set(studio.state.selectedGeneratorIds)
  const chosen = studio.state.polishes.filter((polish) => selected.has(polish.id))
  return chosen.length ? chosen : studio.state.polishes
})

const selectedPolishes = computed(() =>
  studio.state.selectedGeneratorIds
    .map((id) => studio.state.polishes.find((polish) => polish.id === id))
    .filter(Boolean),
)

function toggleSelection(id: string, checked: boolean) {
  const next = checked
    ? [...studio.state.selectedGeneratorIds, id]
    : studio.state.selectedGeneratorIds.filter((selectedId) => selectedId !== id)
  studio.setGeneratorSelection([...new Set(next)])
}

function handleDocumentClick(event: MouseEvent) {
  if (!dropdownRef.value?.contains(event.target as Node)) {
    isDropdownOpen.value = false
  }
}

onMounted(() => {
  document.addEventListener('click', handleDocumentClick)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleDocumentClick)
})
</script>

<template>
  <section id="content" class="card section-shell" aria-labelledby="generator-title">
    <h2 id="generator-title">Generate Design Ideas</h2>
    <p class="help-text">Choose as many polishes as you want. Each idea will pull from your selected pool, and auto-suggest can still pick a smaller set for you.</p>

    <div class="generator-picker">
      <span class="generator-picker-label">Polish selector</span>
      <div ref="dropdownRef" class="generator-dropdown">
        <button class="generator-dropdown-btn" type="button" aria-haspopup="listbox" :aria-expanded="isDropdownOpen" @click="isDropdownOpen = !isDropdownOpen">
          <template v-if="!studio.state.selectedGeneratorIds.length">Select polishes</template>
          <template v-else-if="studio.state.selectedGeneratorIds.length === 1">{{ selectedPolishes[0]?.name }}</template>
          <template v-else>{{ studio.state.selectedGeneratorIds.length }} polishes selected</template>
        </button>
        <div v-if="isDropdownOpen" class="generator-dropdown-menu" role="listbox" aria-multiselectable="true">
          <div class="generator-options">
            <label v-for="polish in studio.state.polishes" :key="polish.id" class="generator-option" role="option" :aria-selected="studio.state.selectedGeneratorIds.includes(polish.id)">
              <input class="generator-option-input" type="checkbox" :checked="studio.state.selectedGeneratorIds.includes(polish.id)" @change="toggleSelection(polish.id, ($event.target as HTMLInputElement).checked)" />
              <span class="generator-option-text">{{ polish.name }} - {{ polish.brand }} ({{ polish.finish }})</span>
            </label>
          </div>
        </div>
      </div>

      <div class="generator-selected-chips" aria-live="polite">
        <span v-if="!selectedPolishes.length" class="generator-chip generator-chip-placeholder">Selected polishes will appear here.</span>
        <span v-for="polish in selectedPolishes" :key="polish!.id" class="generator-chip">
          <span class="generator-chip-swatch" :style="{ background: polish!.color }" aria-hidden="true"></span>
          <span class="generator-chip-text">{{ polish!.name }}</span>
          <button class="generator-chip-remove" type="button" :aria-label="`Remove ${polish!.name} from selection`" @click="studio.removeSelectedGeneratorId(polish!.id)">×</button>
        </span>
      </div>

      <p class="help-text generator-selection-summary">
        <template v-if="!studio.state.polishes.length">No polishes available yet.</template>
        <template v-else-if="!studio.state.selectedGeneratorIds.length">No polishes selected yet. The generator will use your full collection until you choose some.</template>
        <template v-else>{{ studio.state.selectedGeneratorIds.length }} {{ studio.state.selectedGeneratorIds.length === 1 ? 'polish' : 'polishes' }} selected from {{ studio.state.polishes.length }}. Each generated idea can use a smaller mix from this pool.</template>
      </p>
    </div>

    <div class="inline-controls">
      <button class="btn btn-secondary" type="button" @click="studio.autoSuggest()">Auto-suggest</button>
      <button class="btn btn-primary" type="button" @click="studio.generateDesign()">Generate Design</button>
    </div>

    <article class="design-output" aria-live="polite">
      <p v-if="!studio.state.generatedResult" class="muted">Generate a design to see a new idea here.</p>
      <template v-else>
        <h3>{{ studio.state.generatedResult.name }}</h3>
        <p>{{ studio.state.generatedResult.description }}</p>
        <p class="muted">Using {{ studio.state.generatedResult.usedCount }} of {{ studio.state.generatedResult.poolSize }} available {{ studio.state.generatedResult.poolSize === 1 ? 'polish' : 'polishes' }} in your current pool.</p>
        <div class="design-palette">
          <span v-for="polishId in studio.state.generatedResult.polishIds" :key="polishId" class="design-dot" :style="{ background: studio.state.polishes.find((polish) => polish.id === polishId)?.color || '#ccc' }" :title="studio.state.polishes.find((polish) => polish.id === polishId)?.name"></span>
        </div>
        <div class="design-save-row">
          <button class="btn btn-primary" type="button" :disabled="studio.state.generatedResult.saved" :class="{ 'btn-saved': studio.state.generatedResult.saved }" @click="studio.saveGeneratedDesign()">{{ studio.state.generatedResult.saved ? 'Saved' : 'Save Design' }}</button>
          <span class="design-save-status" aria-live="polite">{{ studio.state.generatedResult.status }}</span>
        </div>
      </template>
    </article>
  </section>
</template>
