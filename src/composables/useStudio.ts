import { computed, reactive } from 'vue'

const STORAGE_KEY = 'nail-studio-state-v1'

type InventoryView = 'grid' | 'list'
type FavoriteFilter = 'all' | 'favorites'
type RecentFilter = 'all' | '7' | '30' | 'never'
type SortBy = 'date' | 'uses' | 'favorites'
type DesignStatus = 'all' | 'tried' | 'untried'
type DesignFavoriteFilter = 'all' | 'favoritesOnly'

export interface Polish {
  id: string
  name: string
  brand: string
  color: string
  finish: string
  datePurchased: string
  imageUrl: string
  uses: number
  favorite: boolean
  lastUsedAt: string | null
  createdAt: string
}

export interface Design {
  id: string
  name: string
  createdAt: string
  polishIds: string[]
  description: string
  tried: boolean
  imageUrl: string
}

interface GeneratedResult {
  id: string
  name: string
  description: string
  polishIds: string[]
  usedCount: number
  poolSize: number
  saved: boolean
  status: string
}

interface StudioState {
  polishes: Polish[]
  designs: Design[]
  inventoryView: InventoryView
  filters: {
    search: string
    brand: string
    color: string
    finish: string
    favorite: FavoriteFilter
    recent: RecentFilter
    sortBy: SortBy
  }
  designFilters: {
    status: DesignStatus
    favorite: DesignFavoriteFilter
  }
  selectedGeneratorIds: string[]
  generatedResult: GeneratedResult | null
  lastGeneratedIdea: string
}

const state = reactive<StudioState>({
  polishes: [],
  designs: [],
  inventoryView: 'list',
  filters: {
    search: '',
    brand: 'all',
    color: 'all',
    finish: 'all',
    favorite: 'all',
    recent: 'all',
    sortBy: 'date',
  },
  designFilters: {
    status: 'all',
    favorite: 'all',
  },
  selectedGeneratorIds: [],
  generatedResult: null,
  lastGeneratedIdea: '',
})

let initialized = false

function uid() {
  return `${Date.now()}-${Math.random().toString(16).slice(2, 7)}`
}

function persist() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      polishes: state.polishes,
      designs: state.designs,
    }),
  )
}

function sampleImage(mainColor: string, accentColor: string) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
      <rect width="120" height="120" rx="18" fill="#fff7fb"/>
      <rect x="42" y="10" width="36" height="34" rx="6" fill="#1f1725"/>
      <rect x="28" y="42" width="64" height="56" rx="16" fill="${mainColor}"/>
      <rect x="38" y="50" width="16" height="40" rx="8" fill="${accentColor}" opacity="0.5"/>
    </svg>
  `
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`
}

function createSamplePolishes(): Polish[] {
  return [
    {
      id: uid(),
      name: 'Cherry Glaze',
      brand: 'OPI',
      color: '#d92f4c',
      finish: 'Gloss',
      datePurchased: '2026-01-12',
      imageUrl: sampleImage('#d92f4c', '#ffd3dd'),
      uses: 3,
      favorite: true,
      lastUsedAt: '2026-06-18T12:00:00.000Z',
      createdAt: '2026-01-12T12:00:00.000Z',
    },
    {
      id: uid(),
      name: 'Velvet Orchid',
      brand: 'Essie',
      color: '#9d4edd',
      finish: 'Crème',
      datePurchased: '2026-02-03',
      imageUrl: sampleImage('#9d4edd', '#ead7ff'),
      uses: 1,
      favorite: false,
      lastUsedAt: '2026-05-28T12:00:00.000Z',
      createdAt: '2026-02-03T12:00:00.000Z',
    },
    {
      id: uid(),
      name: 'Sea Glass',
      brand: 'Cirque Colors',
      color: '#52b6c8',
      finish: 'Jelly',
      datePurchased: '2026-03-21',
      imageUrl: sampleImage('#52b6c8', '#d1f4fb'),
      uses: 0,
      favorite: false,
      lastUsedAt: null,
      createdAt: '2026-03-21T12:00:00.000Z',
    },
    {
      id: uid(),
      name: 'Disco Petal',
      brand: 'ILNP',
      color: '#f15bb5',
      finish: 'Holographic',
      datePurchased: '2026-04-09',
      imageUrl: sampleImage('#f15bb5', '#ffe0f3'),
      uses: 2,
      favorite: true,
      lastUsedAt: '2026-06-10T12:00:00.000Z',
      createdAt: '2026-04-09T12:00:00.000Z',
    },
    {
      id: uid(),
      name: 'Molten Sunset',
      brand: 'Mooncat',
      color: '#ff7b54',
      finish: 'Chrome',
      datePurchased: '2026-05-14',
      imageUrl: sampleImage('#ff7b54', '#ffe0d6'),
      uses: 4,
      favorite: true,
      lastUsedAt: '2026-06-21T12:00:00.000Z',
      createdAt: '2026-05-14T12:00:00.000Z',
    },
  ]
}

function mergeSamplePolishes() {
  const samples = createSamplePolishes()
  const existingKeys = new Set(
    state.polishes.map((polish) => `${polish.name.toLowerCase()}::${polish.brand.toLowerCase()}`),
  )
  const toAdd = samples.filter((polish) => {
    const key = `${polish.name.toLowerCase()}::${polish.brand.toLowerCase()}`
    return !existingKeys.has(key)
  })

  if (toAdd.length) {
    state.polishes = [...toAdd, ...state.polishes]
  }
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) {
      state.polishes = createSamplePolishes()
      state.designs = []
      persist()
      return
    }

    const data = JSON.parse(raw)
    state.polishes = Array.isArray(data.polishes) ? data.polishes : []
    state.designs = Array.isArray(data.designs)
      ? data.designs.map((design: Partial<Design>) => ({
          id: design.id || uid(),
          name: design.name || '',
          createdAt: design.createdAt || new Date().toISOString(),
          polishIds: Array.isArray(design.polishIds) ? design.polishIds : [],
          description: design.description || '',
          tried: Boolean(design.tried),
          imageUrl: design.imageUrl || '',
        }))
      : []

    if (!state.polishes.length) {
      state.polishes = createSamplePolishes()
    } else {
      mergeSamplePolishes()
    }

    persist()
  } catch {
    state.polishes = createSamplePolishes()
    state.designs = []
    persist()
  }
}

function ensureInitialized() {
  if (initialized) return
  initialized = true
  loadState()
}

function hexToHsl(hex: string) {
  const c = hex.replace('#', '')
  const rgbValues = [
    parseInt(c.substring(0, 2), 16),
    parseInt(c.substring(2, 4), 16),
    parseInt(c.substring(4, 6), 16),
  ].map((value) => value / 255)
  const [r = 0, g = 0, b = 0] = rgbValues
  const max = Math.max(r, g, b)
  const min = Math.min(r, g, b)
  const delta = max - min

  let hue = 0
  if (delta !== 0) {
    if (max === r) hue = ((g - b) / delta) % 6
    else if (max === g) hue = (b - r) / delta + 2
    else hue = (r - g) / delta + 4
  }
  hue = Math.round(hue * 60)
  if (hue < 0) hue += 360

  const lightness = (max + min) / 2
  const saturation = delta === 0 ? 0 : delta / (1 - Math.abs(2 * lightness - 1))
  return { h: hue, s: saturation, l: lightness }
}

export function colorFamily(hex: string) {
  const { h, s, l } = hexToHsl(hex)
  if (s < 0.15 || l > 0.88 || l < 0.16) return 'neutral'
  if (h < 15 || h >= 345) return 'red'
  if (h < 40) return 'orange'
  if (h < 65) return 'yellow'
  if (h < 160) return 'green'
  if (h < 250) return 'blue'
  if (h < 290) return 'purple'
  return 'pink'
}

export function formatDate(iso: string | null) {
  if (!iso) return 'Unknown'
  return new Date(iso).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

function daysSince(iso: string | null) {
  if (!iso) return null
  const diff = Date.now() - new Date(iso).getTime()
  return Math.floor(diff / (1000 * 60 * 60 * 24))
}

export function inventoryAgeText(polish: Polish) {
  const age = daysSince(polish.datePurchased)
  if (age == null) return ''
  if (age >= 730) return 'Aged 2y+'
  if (age >= 365) return 'Aged 1y+'
  if (age >= 180) return 'Aged 6m+'
  return 'Fresh'
}

function detectDuplicates(name: string, brand: string) {
  return state.polishes.find(
    (item) => item.name.toLowerCase() === name.toLowerCase() && item.brand.toLowerCase() === brand.toLowerCase(),
  )
}

function colorRelationship(polishes: Polish[]) {
  if (polishes.length < 2) return 'single-color focus'
  const hues = polishes.map((polish) => hexToHsl(polish.color).h).sort((a, b) => a - b)
  const firstHue = hues[0] ?? 0
  const lastHue = hues[hues.length - 1] ?? firstHue
  const spread = lastHue - firstHue
  if (spread > 140 && spread < 220) return 'complementary contrast'
  if (spread <= 28) return 'monochrome layering'
  return 'soft color blend'
}

function finishMix(polishes: Polish[]) {
  const unique = [...new Set(polishes.map((polish) => polish.finish.toLowerCase()))]
  if (unique.length === 1) return `${unique[0]} texture`
  if (unique.includes('matte') && unique.includes('gloss')) return 'matte + gloss interplay'
  if (unique.includes('glitter')) return 'glitter accent focus'
  return `mixed finish energy (${unique.join(', ')})`
}

function shuffle<T>(items: T[]) {
  const copy = [...items]
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1))
    const current = copy[index]
    const swap = copy[swapIndex]
    if (current === undefined || swap === undefined) continue
    copy[index] = swap
    copy[swapIndex] = current
  }
  return copy
}

function randomItem<T>(items: T[]) {
  if (!items.length) {
    throw new Error('Cannot choose random item from an empty array')
  }
  return items[Math.floor(Math.random() * items.length)] as T
}

function choosePalette(pool: Polish[]) {
  const shuffled = shuffle(pool)
  const maxCount = Math.min(shuffled.length, 4)
  const minCount = Math.min(maxCount, shuffled.length === 1 ? 1 : 2)
  const count = minCount + Math.floor(Math.random() * (maxCount - minCount + 1))
  return shuffled.slice(0, count)
}

function buildDesignDraft(pool: Polish[]) {
  const polishes = choosePalette(pool)
  if (!polishes.length) {
    throw new Error('Cannot build a design from an empty polish pool')
  }
  const relationship = colorRelationship(polishes)
  const texture = finishMix(polishes)
  const featured = polishes[0] as Polish
  const detailShade = (polishes[1] || featured) as Polish
  const accentShade = polishes[polishes.length - 1] as Polish
  const basePlacements = ['as the base', 'across most nails', 'for a glossy full set', 'on every nail except the accent']
  const detailPlacements = [
    'add slim side-swept lines',
    'paint a curved French tip',
    'layer a negative-space half moon',
    'trace a ribbon-like stripe',
  ]
  const accentIdeas = ['a checker accent nail', 'a tiny starburst cluster', 'a soft aura blend', 'a bold geometric block']
  const finishNotes = [
    'Keep the shape short and glossy for an easy everyday version.',
    'Leave one nail quieter so the contrast reads cleaner.',
    'Finish with extra shine so the color shift feels intentional.',
    'Lean into negative space to keep the palette from feeling heavy.',
  ]
  const titleEndings = ['Studio Look', 'Color Story', 'Signature Set', 'Nail Moment']

  const basePlacement = randomItem(basePlacements)
  const detailPlacement = randomItem(detailPlacements)
  const accentIdea = randomItem(accentIdeas)
  const finishNote = randomItem(finishNotes)
  const extraNames = polishes.slice(2).map((polish) => polish.name)
  const extraPhrase = extraNames.length ? ` Pull in ${extraNames.join(' and ')} for tiny finishing details.` : ''
  const title = `${featured.name} ${randomItem(titleEndings)}`
  const description = `Build a ${relationship} look with ${texture}. Use ${featured.name} ${basePlacement}, ${detailPlacement} with ${detailShade.name}, and make the accent nail all about ${accentShade.name} with ${accentIdea}.${extraPhrase} ${finishNote}`

  return {
    signature: `${polishes.map((polish) => polish.id).join('|')}::${basePlacement}::${detailPlacement}::${accentIdea}::${finishNote}`,
    title,
    polishes,
    description,
  }
}

function getFilteredPolishes() {
  const now = Date.now()
  const filtered = state.polishes.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(state.filters.search) ||
      item.brand.toLowerCase().includes(state.filters.search)
    const matchesBrand = state.filters.brand === 'all' || item.brand === state.filters.brand
    const matchesColor = state.filters.color === 'all' || colorFamily(item.color) === state.filters.color
    const matchesFinish = state.filters.finish === 'all' || item.finish === state.filters.finish
    const matchesFavorite = state.filters.favorite !== 'favorites' || item.favorite

    let matchesRecent = true
    if (state.filters.recent === 'never') {
      matchesRecent = !item.lastUsedAt
    } else if (state.filters.recent !== 'all') {
      if (!item.lastUsedAt) {
        matchesRecent = false
      } else {
        const days = Number(state.filters.recent)
        const cutoff = now - days * 24 * 60 * 60 * 1000
        matchesRecent = new Date(item.lastUsedAt).getTime() >= cutoff
      }
    }

    return matchesSearch && matchesBrand && matchesColor && matchesFinish && matchesFavorite && matchesRecent
  })

  filtered.sort((a, b) => {
    if (state.filters.sortBy === 'uses') return b.uses - a.uses
    if (state.filters.sortBy === 'favorites') return Number(b.favorite) - Number(a.favorite) || b.uses - a.uses
    return new Date(b.datePurchased).getTime() - new Date(a.datePurchased).getTime()
  })

  return filtered
}

function getFilteredDesigns() {
  return state.designs.filter((design) => {
    const matchesStatus =
      state.designFilters.status === 'all' ||
      (state.designFilters.status === 'tried' ? design.tried : !design.tried)

    const includesFavorite = design.polishIds.some((idValue) => {
      const match = state.polishes.find((polish) => polish.id === idValue)
      return Boolean(match?.favorite)
    })

    const matchesFavorite = state.designFilters.favorite !== 'favoritesOnly' || includesFavorite
    return matchesStatus && matchesFavorite
  })
}

function polishNames(ids: string[]) {
  return ids
    .map((idValue) => state.polishes.find((polish) => polish.id === idValue)?.name)
    .filter(Boolean)
    .join(', ')
}

function designTitle(design: Design) {
  if (design.name) return design.name
  const polishes = design.polishIds
    .map((idValue) => state.polishes.find((polish) => polish.id === idValue))
    .filter(Boolean) as Polish[]

  const first = polishes[0]
  const second = polishes[1]
  if (!first) return 'Custom Nail Look'
  if (!second) return `${first.name} Signature Set`
  return `${first.name} + ${second.name} Studio Look`
}

async function lookupPolishUrl(rawUrl: string) {
  let parsed: URL
  try {
    parsed = new URL(rawUrl)
  } catch {
    return { note: 'Invalid URL - fill in manually.' }
  }

  const host = parsed.hostname.replace(/^www\./, '').split('.')
  const hostRoot = host[0] || 'brand'
  const brandGuess = hostRoot.charAt(0).toUpperCase() + hostRoot.slice(1)
  const segments = parsed.pathname.split('/').map((segment) => segment.trim()).filter(Boolean)
  const slug = segments[segments.length - 1] || ''
  const nameGuess = slug.replace(/[-_]/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase()).trim()

  try {
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(rawUrl)}`
    const response = await fetch(proxyUrl)
    if (!response.ok) throw new Error('proxy error')
    const data = await response.json() as { contents?: string }
    const html = data.contents || ''

    const ogTitle = (
      html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i)
    )?.[1] || ''

    const ogSite = (
      html.match(/<meta[^>]+property=["']og:site_name["'][^>]+content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:site_name["']/i)
    )?.[1] || ''

    const ogImage = (
      html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i)
    )?.[1] || ''

    const formulaMap = [
      { key: 'holographic', label: 'Holographic' },
      { key: 'glitter', label: 'Glitter' },
      { key: 'chrome', label: 'Chrome' },
      { key: 'jelly', label: 'Jelly' },
      { key: 'matte', label: 'Matte' },
      { key: 'crème', label: 'Crème' },
      { key: 'cream', label: 'Crème' },
      { key: 'gloss', label: 'Gloss' },
    ]
    const htmlLower = html.toLowerCase()
    const detectedFormula = formulaMap.find((item) => htmlLower.includes(item.key))?.label || ''

    return {
      name: ogTitle ? ogTitle.replace(/\s*[|\-–]\s*.+$/, '').trim() : nameGuess,
      brand: ogSite || brandGuess,
      formula: detectedFormula,
      imageUrl: ogImage,
      note: 'Fields filled from product page - please verify.',
    }
  } catch {
    return {
      name: nameGuess,
      brand: brandGuess,
      formula: '',
      imageUrl: '',
      note: "Filled from URL (couldn't reach page) - please verify.",
    }
  }
}

function addPolish(payload: {
  name: string
  brand: string
  color: string
  finish: string
  datePurchased: string
  imageUrl: string
}) {
  const duplicate = detectDuplicates(payload.name, payload.brand)
  state.polishes.unshift({
    id: uid(),
    name: payload.name,
    brand: payload.brand,
    color: payload.color,
    finish: payload.finish,
    datePurchased: payload.datePurchased,
    imageUrl: payload.imageUrl,
    uses: 0,
    favorite: false,
    lastUsedAt: null,
    createdAt: new Date().toISOString(),
  })
  persist()
  return duplicate
}

function toggleFavorite(id: string) {
  const match = state.polishes.find((polish) => polish.id === id)
  if (!match) return
  match.favorite = !match.favorite
  persist()
}

function logUse(id: string) {
  const match = state.polishes.find((polish) => polish.id === id)
  if (!match) return
  match.uses += 1
  match.lastUsedAt = new Date().toISOString()
  persist()
}

function removeUse(id: string) {
  const match = state.polishes.find((polish) => polish.id === id)
  if (!match) return
  match.uses = Math.max(0, match.uses - 1)
  if (match.uses === 0) {
    match.lastUsedAt = null
  }
  persist()
}

function deletePolish(id: string) {
  state.polishes = state.polishes.filter((polish) => polish.id !== id)
  state.selectedGeneratorIds = state.selectedGeneratorIds.filter((selectedId) => selectedId !== id)
  persist()
}

function setInventoryView(view: InventoryView) {
  state.inventoryView = view
}

function setGeneratorSelection(ids: string[]) {
  state.selectedGeneratorIds = ids
}

function removeSelectedGeneratorId(id: string) {
  state.selectedGeneratorIds = state.selectedGeneratorIds.filter((selectedId) => selectedId !== id)
}

function autoSuggest() {
  state.selectedGeneratorIds = [...state.polishes]
    .sort((a, b) => a.uses - b.uses || new Date(b.datePurchased).getTime() - new Date(a.datePurchased).getTime())
    .slice(0, Math.min(4, state.polishes.length))
    .map((polish) => polish.id)
}

function generateDesign() {
  const selectedSet = new Set(state.selectedGeneratorIds)
  const chosen = state.polishes.filter((polish) => selectedSet.has(polish.id))
  const pool = chosen.length ? chosen : state.polishes
  if (!pool.length) return

  let draft = buildDesignDraft(pool)
  let attempts = 0
  while (draft.signature === state.lastGeneratedIdea && attempts < 8) {
    draft = buildDesignDraft(pool)
    attempts += 1
  }
  state.lastGeneratedIdea = draft.signature
  state.generatedResult = {
    id: uid(),
    name: draft.title,
    description: draft.description,
    polishIds: draft.polishes.map((polish) => polish.id),
    usedCount: draft.polishes.length,
    poolSize: pool.length,
    saved: false,
    status: '',
  }
}

function saveGeneratedDesign() {
  if (!state.generatedResult || state.generatedResult.saved) return
  state.designs.unshift({
    id: state.generatedResult.id,
    name: state.generatedResult.name,
    createdAt: new Date().toISOString(),
    polishIds: state.generatedResult.polishIds,
    description: state.generatedResult.description,
    tried: false,
    imageUrl: '',
  })
  state.generatedResult.saved = true
  state.generatedResult.status = 'Design saved to your library.'
  persist()
}

function toggleDesignTried(id: string) {
  const match = state.designs.find((design) => design.id === id)
  if (!match) return
  match.tried = !match.tried
  persist()
}

function deleteDesign(id: string) {
  state.designs = state.designs.filter((design) => design.id !== id)
  persist()
}

function readFileAsDataUrl(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result || ''))
    reader.onerror = () => reject(new Error('Unable to read file'))
    reader.readAsDataURL(file)
  })
}

async function saveDesignImage(id: string, file: File) {
  if (!file.type.startsWith('image/')) {
    throw new Error('Please choose an image file.')
  }
  const match = state.designs.find((design) => design.id === id)
  if (!match) return
  match.imageUrl = await readFileAsDataUrl(file)
  persist()
}

function clearDesignImage(id: string) {
  const match = state.designs.find((design) => design.id === id)
  if (!match) return
  match.imageUrl = ''
  persist()
}

const filteredPolishes = computed(() => getFilteredPolishes())
const filteredDesigns = computed(() => getFilteredDesigns())
const brandOptions = computed(() => [...new Set(state.polishes.map((polish) => polish.brand).filter(Boolean))].sort((a, b) => a.localeCompare(b)))
const finishOptions = computed(() => {
  const baseOptions = ['Matte', 'Gloss', 'Glitter', 'Chrome', 'Jelly', 'Holographic', 'Crème']
  const dynamicOptions = state.polishes.map((polish) => polish.finish).filter(Boolean)
  return [...new Set([...baseOptions, ...dynamicOptions])]
})

export function useStudio() {
  ensureInitialized()

  return {
    state,
    filteredPolishes,
    filteredDesigns,
    brandOptions,
    finishOptions,
    addPolish,
    toggleFavorite,
    logUse,
    removeUse,
    deletePolish,
    setInventoryView,
    setGeneratorSelection,
    removeSelectedGeneratorId,
    autoSuggest,
    generateDesign,
    saveGeneratedDesign,
    toggleDesignTried,
    deleteDesign,
    saveDesignImage,
    clearDesignImage,
    designTitle,
    polishNames,
    lookupPolishUrl,
    formatDate,
    inventoryAgeText,
  }
}
