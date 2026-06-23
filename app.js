const STORAGE_KEY = "nail-studio-state-v1";
const currentPage = document.body.dataset.page || "home";

const state = {
  polishes: [],
  designs: [],
  inventoryView: "grid",
  filters: {
    search: "",
    brand: "all",
    color: "all",
    finish: "all",
    favorite: "all",
    recent: "all",
    sortBy: "date"
  },
  designFilters: {
    status: "all",
    favorite: "all"
  },
  selectedGeneratorIds: [],
  generatedDraft: null
};

const els = {
  polishForm: document.getElementById("polishForm"),
  polishUrlInput: document.getElementById("polishUrlInput"),
  polishUrlBtn: document.getElementById("polishUrlBtn"),
  polishUrlStatus: document.getElementById("polishUrlStatus"),
  toggleAddForm: document.getElementById("toggleAddForm"),
  cancelAddForm: document.getElementById("cancelAddForm"),
  addPolishPanel: document.getElementById("addPolishPanel"),
  headerStats: document.getElementById("headerStats"),
  inventoryContainer: document.getElementById("inventoryContainer"),
  cardTemplate: document.getElementById("polishCardTemplate"),
  finishFilter: document.getElementById("formulaFilter"),
  searchInput: document.getElementById("searchInput"),
  brandFilter: document.getElementById("brandFilter"),
  colorFilter: document.getElementById("colorFilter"),
  favoriteFilter: document.getElementById("favoriteFilter"),
  recentFilter: document.getElementById("recentFilter"),
  sortBy: document.getElementById("sortBy"),
  gridViewBtn: document.getElementById("gridViewBtn"),
  listViewBtn: document.getElementById("listViewBtn"),
  generatorPolishList: document.getElementById("generatorPolishList"),
  autoSuggestBtn: document.getElementById("autoSuggestBtn"),
  generateDesignBtn: document.getElementById("generateDesignBtn"),
  generatedDesign: document.getElementById("generatedDesign"),
  designLibrary: document.getElementById("designLibrary"),
  designStatusFilter: document.getElementById("designStatusFilter"),
  designFavoriteFilter: document.getElementById("designFavoriteFilter")
};

function id() {
  return `${Date.now()}-${Math.random().toString(16).slice(2, 7)}`;
}

function sampleImage(mainColor, accentColor) {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 120">
      <rect width="120" height="120" rx="18" fill="#fff7fb"/>
      <rect x="42" y="10" width="36" height="34" rx="6" fill="#1f1725"/>
      <rect x="28" y="42" width="64" height="56" rx="16" fill="${mainColor}"/>
      <rect x="38" y="50" width="16" height="40" rx="8" fill="${accentColor}" opacity="0.5"/>
    </svg>
  `;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

function createSamplePolishes() {
  return [
    {
      id: id(),
      name: "Cherry Glaze",
      brand: "OPI",
      color: "#d92f4c",
      finish: "Gloss",
      datePurchased: "2026-01-12",
      imageUrl: sampleImage("#d92f4c", "#ffd3dd"),
      uses: 3,
      favorite: true,
      lastUsedAt: "2026-06-18T12:00:00.000Z",
      createdAt: "2026-01-12T12:00:00.000Z"
    },
    {
      id: id(),
      name: "Velvet Orchid",
      brand: "Essie",
      color: "#9d4edd",
      finish: "Crème",
      datePurchased: "2026-02-03",
      imageUrl: sampleImage("#9d4edd", "#ead7ff"),
      uses: 1,
      favorite: false,
      lastUsedAt: "2026-05-28T12:00:00.000Z",
      createdAt: "2026-02-03T12:00:00.000Z"
    },
    {
      id: id(),
      name: "Sea Glass",
      brand: "Cirque Colors",
      color: "#52b6c8",
      finish: "Jelly",
      datePurchased: "2026-03-21",
      imageUrl: sampleImage("#52b6c8", "#d1f4fb"),
      uses: 0,
      favorite: false,
      lastUsedAt: null,
      createdAt: "2026-03-21T12:00:00.000Z"
    },
    {
      id: id(),
      name: "Disco Petal",
      brand: "ILNP",
      color: "#f15bb5",
      finish: "Holographic",
      datePurchased: "2026-04-09",
      imageUrl: sampleImage("#f15bb5", "#ffe0f3"),
      uses: 2,
      favorite: true,
      lastUsedAt: "2026-06-10T12:00:00.000Z",
      createdAt: "2026-04-09T12:00:00.000Z"
    },
    {
      id: id(),
      name: "Molten Sunset",
      brand: "Mooncat",
      color: "#ff7b54",
      finish: "Chrome",
      datePurchased: "2026-05-14",
      imageUrl: sampleImage("#ff7b54", "#ffe0d6"),
      uses: 4,
      favorite: true,
      lastUsedAt: "2026-06-21T12:00:00.000Z",
      createdAt: "2026-05-14T12:00:00.000Z"
    }
  ];
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      state.polishes = createSamplePolishes();
      state.designs = [];
      persist();
      return;
    }
    const data = JSON.parse(raw);
    state.polishes = Array.isArray(data.polishes) ? data.polishes : [];
    state.designs = Array.isArray(data.designs) ? data.designs : [];
    if (!state.polishes.length) {
      state.polishes = createSamplePolishes();
      persist();
      return;
    }

    const addedCount = mergeSamplePolishes();
    if (addedCount) {
      persist();
    }
  } catch {
    state.polishes = [];
    state.designs = [];
  }
}

function mergeSamplePolishes() {
  const samples = createSamplePolishes();
  const existingKeys = new Set(
    state.polishes.map((polish) => `${polish.name.toLowerCase()}::${polish.brand.toLowerCase()}`)
  );
  const toAdd = samples.filter((polish) => {
    const key = `${polish.name.toLowerCase()}::${polish.brand.toLowerCase()}`;
    return !existingKeys.has(key);
  });

  if (!toAdd.length) return 0;

  state.polishes = [...toAdd, ...state.polishes];
  persist();
  return toAdd.length;
}

function applyPageDefaults() {
  const defaultView = document.body.dataset.defaultView;
  if (defaultView === "grid" || defaultView === "list") {
    state.inventoryView = defaultView;
  }
}

function persist() {
  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({ polishes: state.polishes, designs: state.designs })
  );
}

function parseTags(text) {
  return text
    .split(",")
    .map((tag) => tag.trim())
    .filter(Boolean);
}

function hexToHsl(hex) {
  const c = hex.replace("#", "");
  const rgb = [
    parseInt(c.substring(0, 2), 16),
    parseInt(c.substring(2, 4), 16),
    parseInt(c.substring(4, 6), 16)
  ].map((value) => value / 255);
  const max = Math.max(...rgb);
  const min = Math.min(...rgb);
  const delta = max - min;

  let hue = 0;
  if (delta !== 0) {
    if (max === rgb[0]) hue = ((rgb[1] - rgb[2]) / delta) % 6;
    else if (max === rgb[1]) hue = (rgb[2] - rgb[0]) / delta + 2;
    else hue = (rgb[0] - rgb[1]) / delta + 4;
  }
  hue = Math.round(hue * 60);
  if (hue < 0) hue += 360;

  const lightness = (max + min) / 2;
  const saturation = delta === 0 ? 0 : delta / (1 - Math.abs(2 * lightness - 1));
  return { h: hue, s: saturation, l: lightness };
}

function colorFamily(hex) {
  const { h, s, l } = hexToHsl(hex);
  if (s < 0.15 || l > 0.88 || l < 0.16) return "neutral";
  if (h < 15 || h >= 345) return "red";
  if (h < 40) return "orange";
  if (h < 65) return "yellow";
  if (h < 160) return "green";
  if (h < 250) return "blue";
  if (h < 290) return "purple";
  return "pink";
}

function formatDate(iso) {
  if (!iso) return "Unknown";
  return new Date(iso).toLocaleDateString(undefined, { month: "short", day: "numeric", year: "numeric" });
}

function daysSince(iso) {
  if (!iso) return null;
  const diff = Date.now() - new Date(iso).getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

function inventoryAgeText(polish) {
  const age = daysSince(polish.datePurchased);
  if (age == null) return "";
  if (age >= 730) return "Aged 2y+";
  if (age >= 365) return "Aged 1y+";
  if (age >= 180) return "Aged 6m+";
  return "Fresh";
}

function detectDuplicates(name, brand) {
  return state.polishes.find(
    (item) => item.name.toLowerCase() === name.toLowerCase() && item.brand.toLowerCase() === brand.toLowerCase()
  );
}

function onAddPolish(event) {
  event.preventDefault();
  const form = new FormData(event.currentTarget);
  const name = String(form.get("name") || "").trim();
  const brand = String(form.get("brand") || "").trim();
  const color = String(form.get("color") || "#e2527d");
  const finish = String(form.get("formula") || "").trim();
  const datePurchased = String(form.get("datePurchased") || "");
  const imageUrl = String(form.get("imageUrl") || "").trim();

  if (!name || !brand || !finish || !datePurchased || !imageUrl) return;

  const duplicate = detectDuplicates(name, brand);
  if (duplicate) {
    alert("Possible duplicate: this polish name and brand already exist.");
  }

  state.polishes.unshift({
    id: id(),
    name,
    brand,
    color,
    finish,
    datePurchased,
    imageUrl,
    uses: 0,
    favorite: false,
    lastUsedAt: null,
    createdAt: new Date().toISOString()
  });

  event.currentTarget.reset();
  event.currentTarget.querySelector("input[name='color']").value = "#e2527d";
  // Close the add panel after saving
  if (els.addPolishPanel) {
    els.addPolishPanel.hidden = true;
    if (els.toggleAddForm) {
      els.toggleAddForm.setAttribute("aria-expanded", "false");
      els.toggleAddForm.textContent = "+ Add Polish";
    }
  }
  persist();
  refresh();
}

function filteredPolishes() {
  const now = Date.now();
  const filtered = state.polishes.filter((item) => {
    const brand = item.brand || "";
    const formula = item.finish || item.formula || "";
    const matchesSearch =
      item.name.toLowerCase().includes(state.filters.search) || brand.toLowerCase().includes(state.filters.search);
    const matchesBrand = state.filters.brand === "all" || brand === state.filters.brand;
    const matchesColor = state.filters.color === "all" || colorFamily(item.color) === state.filters.color;
    const matchesFinish = state.filters.finish === "all" || formula === state.filters.finish;
    const matchesFavorite = state.filters.favorite !== "favorites" || item.favorite;

    let matchesRecent = true;
    if (state.filters.recent === "never") {
      matchesRecent = !item.lastUsedAt;
    } else if (state.filters.recent !== "all") {
      if (!item.lastUsedAt) {
        matchesRecent = false;
      } else {
        const days = Number(state.filters.recent);
        const cutoff = now - days * 24 * 60 * 60 * 1000;
        matchesRecent = new Date(item.lastUsedAt).getTime() >= cutoff;
      }
    }

    return matchesSearch && matchesBrand && matchesColor && matchesFinish && matchesFavorite && matchesRecent;
  });

  filtered.sort((a, b) => {
    if (state.filters.sortBy === "uses") return b.uses - a.uses;
    if (state.filters.sortBy === "favorites") return Number(b.favorite) - Number(a.favorite) || b.uses - a.uses;
    return new Date(b.datePurchased).getTime() - new Date(a.datePurchased).getTime();
  });

  return filtered;
}

function renderHeaderStats() {
  if (!els.headerStats) return;
  const total = state.polishes.length;
  const favorites = state.polishes.filter((p) => p.favorite).length;
  const totalUses = state.polishes.reduce((sum, p) => sum + p.uses, 0);
  const unused = state.polishes.filter((p) => p.uses === 0).length;

  els.headerStats.innerHTML = [
    `<span class="stat-chip">${total} polishes</span>`,
    `<span class="stat-chip">${favorites} favorites</span>`,
    `<span class="stat-chip">${totalUses} logged uses</span>`,
    `<span class="stat-chip">${unused} unused</span>`
  ].join("");
}

function renderInventory() {
  if (!els.inventoryContainer || !els.cardTemplate) return;

  const items = filteredPolishes();
  els.inventoryContainer.classList.toggle("grid-view", state.inventoryView === "grid");
  els.inventoryContainer.classList.toggle("list-view", state.inventoryView === "list");

  if (!items.length) {
    els.inventoryContainer.innerHTML = `<p class="muted">No polishes match this filter yet.</p>`;
    return;
  }

  const fragment = document.createDocumentFragment();

  items.forEach((item) => {
    const node = els.cardTemplate.content.firstElementChild.cloneNode(true);
    node.querySelector(".swatch").style.background = item.color;
    node.querySelector(".polish-name").textContent = item.name;
    node.querySelector(".polish-meta").textContent = `${item.brand} | ${item.finish} | ${formatDate(item.datePurchased)} | ${inventoryAgeText(item)}`;
    const imageWrap = node.querySelector(".polish-image-wrap");
    if (item.imageUrl) {
      imageWrap.innerHTML = `<img src="${item.imageUrl}" alt="${item.name}" class="polish-card-img" />`;
    } else {
      imageWrap.innerHTML = "";
    }
    node.querySelector(".polish-usage").textContent = `Uses: ${item.uses}${item.lastUsedAt ? ` | Last used: ${formatDate(item.lastUsedAt)}` : ""}`;

    const favoriteBtn = node.querySelector(".favorite-btn");
    const removeUseBtn = node.querySelector(".remove-use-btn");
    favoriteBtn.textContent = item.favorite ? "★" : "☆";
    favoriteBtn.setAttribute("aria-pressed", item.favorite ? "true" : "false");
    removeUseBtn.disabled = item.uses === 0;

    favoriteBtn.addEventListener("click", () => {
      item.favorite = !item.favorite;
      persist();
      refresh();
    });

    node.querySelector(".use-btn").addEventListener("click", () => {
      item.uses += 1;
      item.lastUsedAt = new Date().toISOString();
      persist();
      refresh();
    });

    removeUseBtn.addEventListener("click", () => {
      item.uses = Math.max(0, item.uses - 1);
      if (item.uses === 0) {
        item.lastUsedAt = null;
      }
      persist();
      refresh();
    });

    node.querySelector(".delete-btn").addEventListener("click", () => {
      const shouldDelete = window.confirm(`Delete ${item.name} by ${item.brand}?`);
      if (!shouldDelete) return;
      state.polishes = state.polishes.filter((p) => p.id !== item.id);
      state.selectedGeneratorIds = state.selectedGeneratorIds.filter((idValue) => idValue !== item.id);
      persist();
      refresh();
    });

    fragment.appendChild(node);
  });

  els.inventoryContainer.innerHTML = "";
  els.inventoryContainer.appendChild(fragment);
}

function populateFinishFilter() {
  if (!els.finishFilter) return;
  const current = state.filters.finish;
  const baseOptions = ["Matte", "Gloss", "Glitter", "Chrome", "Jelly", "Holographic", "Crème"];
  const dynamicOptions = state.polishes
    .map((p) => p.finish || p.formula || "")
    .filter(Boolean);
  const uniqueFinishes = [...new Set([...baseOptions, ...dynamicOptions])];
  els.finishFilter.innerHTML = `<option value="all">All formulas</option>${uniqueFinishes
    .map((finish) => `<option value="${finish}">${finish}</option>`)
    .join("")}`;
  els.finishFilter.value = uniqueFinishes.includes(current) ? current : "all";
  state.filters.finish = els.finishFilter.value;
}

function populateBrandFilter() {
  if (!els.brandFilter) return;
  const current = state.filters.brand;
  const uniqueBrands = [...new Set(state.polishes.map((p) => p.brand).filter(Boolean))].sort((a, b) => a.localeCompare(b));
  els.brandFilter.innerHTML = `<option value="all">All brands</option>${uniqueBrands.length ? uniqueBrands
    .map((brand) => `<option value="${brand}">${brand}</option>`)
    .join("") : `<option value="" disabled>No brands yet</option>`}`;
  els.brandFilter.value = uniqueBrands.includes(current) ? current : "all";
  state.filters.brand = els.brandFilter.value;
}

function renderGeneratorList() {
  if (!els.generatorPolishList) return;
  if (!state.polishes.length) {
    els.generatorPolishList.innerHTML = `<p class="muted">Add polishes to start generating ideas.</p>`;
    return;
  }

  els.generatorPolishList.innerHTML = state.polishes
    .map(
      (polish) => `
      <label class="generator-check">
        <input type="checkbox" value="${polish.id}" ${state.selectedGeneratorIds.includes(polish.id) ? "checked" : ""} />
        <span>${polish.name} (${polish.finish})</span>
      </label>
    `
    )
    .join("");

  els.generatorPolishList.querySelectorAll("input[type='checkbox']").forEach((checkbox) => {
    checkbox.addEventListener("change", (event) => {
      const selected = Array.from(els.generatorPolishList.querySelectorAll("input[type='checkbox']:checked"))
        .map((node) => node.value)
        .slice(0, 3);
      state.selectedGeneratorIds = selected;
      if (!selected.includes(event.target.value)) {
        event.target.checked = false;
      }
    });
  });
}

function colorRelationship(polishes) {
  if (polishes.length < 2) return "single-color focus";
  const hues = polishes.map((p) => hexToHsl(p.color).h).sort((a, b) => a - b);
  const spread = hues[hues.length - 1] - hues[0];
  if (spread > 140 && spread < 220) return "complementary contrast";
  if (spread <= 28) return "monochrome layering";
  return "analog color flow";
}

function finishMix(polishes) {
  const unique = [...new Set(polishes.map((p) => p.finish.toLowerCase()))];
  if (unique.length === 1) return `${unique[0]} texture`;
  if (unique.includes("matte") && unique.includes("gloss")) return "matte + gloss interplay";
  if (unique.includes("glitter")) return "glitter accent focus";
  return `mixed finish energy (${unique.join(", ")})`;
}

function generateDesign() {
  if (!els.generatedDesign) return;
  const chosen = state.polishes.filter((p) => state.selectedGeneratorIds.includes(p.id));
  const polishes = chosen.length ? chosen : state.polishes.slice(0, 3);

  if (!polishes.length) {
    els.generatedDesign.innerHTML = `<p class="muted">You need at least one polish first.</p>`;
    return;
  }

  const relationship = colorRelationship(polishes);
  const texture = finishMix(polishes);
  const featured = polishes[0];

  const description = `Build a ${relationship} look with ${texture}. Use ${featured.name} as the base, then add thin diagonal details with ${polishes
    .slice(1)
    .map((p) => p.name)
    .join(" and ") || "a matching topper"}. Finish with one accent nail featuring a bold shape.`;

  state.generatedDraft = {
    id: id(),
    createdAt: new Date().toISOString(),
    polishIds: polishes.map((p) => p.id),
    description,
    tried: false
  };

  els.generatedDesign.innerHTML = `
    <h3>Generated Idea</h3>
    <p>${description}</p>
    <div class="design-palette">${polishes
      .map((p) => `<span class="design-dot" style="background:${p.color}" title="${p.name}"></span>`)
      .join("")}</div>
    <button class="btn btn-primary" id="saveDesignBtn" type="button">Save Design</button>
  `;

  document.getElementById("saveDesignBtn").addEventListener("click", () => {
    if (!state.generatedDraft) return;
    state.designs.unshift(state.generatedDraft);
    state.generatedDraft = null;
    persist();
    refresh();
  });
}

function suggestPolishes() {
  const picks = [...state.polishes]
    .sort((a, b) => a.uses - b.uses || new Date(b.datePurchased).getTime() - new Date(a.datePurchased).getTime())
    .slice(0, 3)
    .map((p) => p.id);
  state.selectedGeneratorIds = picks;
  renderGeneratorList();
}

function filteredDesigns() {
  return state.designs.filter((design) => {
    const matchesStatus =
      state.designFilters.status === "all" ||
      (state.designFilters.status === "tried" ? design.tried : !design.tried);

    const includesFavorite = design.polishIds.some((idValue) => {
      const match = state.polishes.find((p) => p.id === idValue);
      return match && match.favorite;
    });

    const matchesFavorite = state.designFilters.favorite !== "favoritesOnly" || includesFavorite;

    return matchesStatus && matchesFavorite;
  });
}

function polishNames(ids) {
  return ids
    .map((idValue) => state.polishes.find((p) => p.id === idValue)?.name)
    .filter(Boolean)
    .join(", ");
}

function renderDesignLibrary() {
  if (!els.designLibrary) return;
  const items = filteredDesigns();
  if (!items.length) {
    els.designLibrary.innerHTML = `<p class="muted">No saved designs match this filter yet.</p>`;
    return;
  }

  els.designLibrary.innerHTML = items
    .map(
      (design) => `
      <article class="design-card" role="listitem">
        <h3>${design.tried ? "Tried" : "Not Tried"}</h3>
        <p>${design.description}</p>
        <p><strong>Polishes:</strong> ${polishNames(design.polishIds)}</p>
        <p><strong>Saved:</strong> ${formatDate(design.createdAt)}</p>
        <div class="inline-controls">
          <button class="btn btn-secondary small" data-action="toggle" data-id="${design.id}" type="button">Mark as ${
            design.tried ? "Not Tried" : "Tried"
          }</button>
          <button class="btn btn-danger small" data-action="delete" data-id="${design.id}" type="button">Delete</button>
        </div>
      </article>
    `
    )
    .join("");

  els.designLibrary.querySelectorAll("button[data-action]").forEach((button) => {
    button.addEventListener("click", (event) => {
      const designId = event.currentTarget.getAttribute("data-id");
      const action = event.currentTarget.getAttribute("data-action");
      if (action === "toggle") {
        const match = state.designs.find((d) => d.id === designId);
        if (match) {
          match.tried = !match.tried;
        }
      } else {
        state.designs = state.designs.filter((d) => d.id !== designId);
      }
      persist();
      refresh();
    });
  });
}

async function lookupPolishUrl(rawUrl) {
  let parsed;
  try {
    parsed = new URL(rawUrl);
  } catch {
    return { note: "Invalid URL — fill in manually." };
  }

  // Derive brand from hostname (e.g. www.opi.com → OPI, essie.com → Essie)
  const host = parsed.hostname.replace(/^www\./, "").split(".");
  const brandGuess = host[0].charAt(0).toUpperCase() + host[0].slice(1);

  // Derive name from the last non-empty URL path segment
  const segments = parsed.pathname.split("/").map((s) => s.trim()).filter(Boolean);
  const slug = segments[segments.length - 1] || "";
  const nameGuess = slug
    .replace(/[-_]/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase())
    .trim();

  // Try fetching via CORS proxy to pull og:title / og:site_name / og:image / formula
  try {
    const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(rawUrl)}`;
    const res = await fetch(proxyUrl, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) throw new Error("proxy error");
    const data = await res.json();
    const html = data.contents || "";

    const ogTitle = (
      html.match(/<meta[^>]+property=["']og:title["'][^>]+content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:title["']/i)
    )?.[1] || "";

    const ogSite = (
      html.match(/<meta[^>]+property=["']og:site_name["'][^>]+content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:site_name["']/i)
    )?.[1] || "";

    const ogImage = (
      html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i) ||
      html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+property=["']og:image["']/i)
    )?.[1] || "";

    // Detect formula by scanning page text for known keywords (order matters — most specific first)
    const formulaMap = [
      { key: "holographic", label: "Holographic" },
      { key: "glitter",     label: "Glitter" },
      { key: "chrome",      label: "Chrome" },
      { key: "jelly",       label: "Jelly" },
      { key: "matte",       label: "Matte" },
      { key: "crème",       label: "Crème" },
      { key: "cream",       label: "Crème" },
      { key: "gloss",       label: "Gloss" },
    ];
    const htmlLower = html.toLowerCase();
    const detectedFormula = formulaMap.find((f) => htmlLower.includes(f.key))?.label || "";

    const name = ogTitle
      ? ogTitle.replace(/\s*[|\-–]\s*.+$/, "").trim()
      : nameGuess;

    return {
      name: name || nameGuess,
      brand: ogSite || brandGuess,
      formula: detectedFormula,
      imageUrl: ogImage,
      note: "Fields filled from product page — please verify.",
    };
  } catch {
    return {
      name: nameGuess,
      brand: brandGuess,
      formula: "",
      imageUrl: "",
      note: "Filled from URL (couldn't reach page) — please verify.",
    };
  }
}

function bindEvents() {
  if (els.toggleAddForm && els.addPolishPanel) {
    const openPanel = () => {
      els.addPolishPanel.hidden = false;
      els.toggleAddForm.setAttribute("aria-expanded", "true");
      els.toggleAddForm.textContent = "✕ Close";
      els.addPolishPanel.scrollIntoView({ behavior: "smooth", block: "nearest" });
    };
    const closePanel = () => {
      els.addPolishPanel.hidden = true;
      els.toggleAddForm.setAttribute("aria-expanded", "false");
      els.toggleAddForm.textContent = "+ Add Polish";
    };
    els.toggleAddForm.addEventListener("click", () => {
      els.addPolishPanel.hidden ? openPanel() : closePanel();
    });
    if (els.cancelAddForm) {
      els.cancelAddForm.addEventListener("click", closePanel);
    }
  }

  if (els.polishForm) {
    els.polishForm.addEventListener("submit", onAddPolish);
  }

  if (els.polishUrlBtn) {
    els.polishUrlBtn.addEventListener("click", async () => {
      const url = (els.polishUrlInput.value || "").trim();
      if (!url) return;
      els.polishUrlBtn.textContent = "Looking up…";
      els.polishUrlBtn.disabled = true;
      els.polishUrlStatus.textContent = "";
      try {
        const result = await lookupPolishUrl(url);
        const form = els.polishForm;
        if (result.name) form.elements["name"].value = result.name;
        if (result.brand) form.elements["brand"].value = result.brand;
        if (result.formula) form.elements["formula"].value = result.formula;
        if (result.imageUrl) form.elements["imageUrl"].value = result.imageUrl;
        els.polishUrlStatus.textContent = result.note || "Fields filled — please verify and complete the rest.";
      } catch {
        els.polishUrlStatus.textContent = "Couldn't read that page. Fill in manually.";
      } finally {
        els.polishUrlBtn.textContent = "Auto-fill";
        els.polishUrlBtn.disabled = false;
      }
    });
  }

  if (els.searchInput) {
    els.searchInput.addEventListener("input", (event) => {
      state.filters.search = event.target.value.toLowerCase().trim();
      refresh();
    });
  }

  if (els.brandFilter) {
    els.brandFilter.addEventListener("change", (event) => {
      state.filters.brand = event.target.value;
      refresh();
    });
  }

  if (els.colorFilter) {
    els.colorFilter.addEventListener("change", (event) => {
      state.filters.color = event.target.value;
      refresh();
    });
  }

  if (els.finishFilter) {
    els.finishFilter.addEventListener("change", (event) => {
      state.filters.finish = event.target.value;
      refresh();
    });
  }

  if (els.favoriteFilter) {
    els.favoriteFilter.addEventListener("change", (event) => {
      state.filters.favorite = event.target.checked ? "favorites" : "all";
      refresh();
    });
  }

  if (els.recentFilter) {
    els.recentFilter.addEventListener("change", (event) => {
      state.filters.recent = event.target.value;
      refresh();
    });
  }

  if (els.sortBy) {
    els.sortBy.addEventListener("change", (event) => {
      state.filters.sortBy = event.target.value;
      refresh();
    });
  }

  if (els.gridViewBtn && els.listViewBtn) {
    els.gridViewBtn.addEventListener("click", () => {
      state.inventoryView = "grid";
      els.gridViewBtn.setAttribute("aria-pressed", "true");
      els.listViewBtn.setAttribute("aria-pressed", "false");
      refresh();
    });

    els.listViewBtn.addEventListener("click", () => {
      state.inventoryView = "list";
      els.gridViewBtn.setAttribute("aria-pressed", "false");
      els.listViewBtn.setAttribute("aria-pressed", "true");
      refresh();
    });
  }

  if (els.autoSuggestBtn) {
    els.autoSuggestBtn.addEventListener("click", suggestPolishes);
  }

  if (els.generateDesignBtn) {
    els.generateDesignBtn.addEventListener("click", generateDesign);
  }

  if (els.designStatusFilter) {
    els.designStatusFilter.addEventListener("change", (event) => {
      state.designFilters.status = event.target.value;
      refresh();
    });
  }

  if (els.designFavoriteFilter) {
    els.designFavoriteFilter.addEventListener("change", (event) => {
      state.designFilters.favorite = event.target.value;
      refresh();
    });
  }
}

function refresh() {
  populateBrandFilter();
  populateFinishFilter();

  if (els.favoriteFilter) {
    els.favoriteFilter.checked = state.filters.favorite === "favorites";
  }

  if (els.gridViewBtn && els.listViewBtn) {
    els.gridViewBtn.setAttribute("aria-pressed", state.inventoryView === "grid" ? "true" : "false");
    els.listViewBtn.setAttribute("aria-pressed", state.inventoryView === "list" ? "true" : "false");
  }

  renderHeaderStats();
  renderInventory();
  renderGeneratorList();
  renderDesignLibrary();
}

function scrollToContentOnNav() {
  if (window.location.hash !== "#content") return;
  const target = document.getElementById("content");
  if (!target) return;
  window.scrollTo(0, 0);
  window.setTimeout(() => {
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }, 80);
}

loadState();
applyPageDefaults();
bindEvents();
refresh();
scrollToContentOnNav();
