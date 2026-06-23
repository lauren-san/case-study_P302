const STORAGE_KEY = "nail-studio-state-v1";

const state = {
  polishes: [],
  designs: [],
  inventoryView: "grid",
  filters: {
    search: "",
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
  headerStats: document.getElementById("headerStats"),
  inventoryContainer: document.getElementById("inventoryContainer"),
  cardTemplate: document.getElementById("polishCardTemplate"),
  finishFilter: document.getElementById("finishFilter"),
  searchInput: document.getElementById("searchInput"),
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

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    const data = JSON.parse(raw);
    state.polishes = Array.isArray(data.polishes) ? data.polishes : [];
    state.designs = Array.isArray(data.designs) ? data.designs : [];
  } catch {
    state.polishes = [];
    state.designs = [];
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
  const finish = String(form.get("finish") || "").trim();
  const datePurchased = String(form.get("datePurchased") || "");
  const tags = parseTags(String(form.get("tags") || ""));

  if (!name || !brand || !finish || !datePurchased) return;

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
    tags,
    uses: 0,
    favorite: false,
    lastUsedAt: null,
    createdAt: new Date().toISOString()
  });

  event.currentTarget.reset();
  event.currentTarget.querySelector("input[name='color']").value = "#e2527d";
  persist();
  refresh();
}

function filteredPolishes() {
  const now = Date.now();
  const filtered = state.polishes.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(state.filters.search) || item.brand.toLowerCase().includes(state.filters.search);
    const matchesColor = state.filters.color === "all" || colorFamily(item.color) === state.filters.color;
    const matchesFinish = state.filters.finish === "all" || item.finish === state.filters.finish;
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

    return matchesSearch && matchesColor && matchesFinish && matchesFavorite && matchesRecent;
  });

  filtered.sort((a, b) => {
    if (state.filters.sortBy === "uses") return b.uses - a.uses;
    if (state.filters.sortBy === "favorites") return Number(b.favorite) - Number(a.favorite) || b.uses - a.uses;
    return new Date(b.datePurchased).getTime() - new Date(a.datePurchased).getTime();
  });

  return filtered;
}

function renderHeaderStats() {
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
    node.querySelector(".polish-tags").textContent = item.tags.length ? `Tags: ${item.tags.join(", ")}` : "Tags: none";
    node.querySelector(".polish-usage").textContent = `Uses: ${item.uses}${item.lastUsedAt ? ` | Last used: ${formatDate(item.lastUsedAt)}` : ""}`;

    const favoriteBtn = node.querySelector(".favorite-btn");
    favoriteBtn.textContent = item.favorite ? "★" : "☆";
    favoriteBtn.setAttribute("aria-pressed", item.favorite ? "true" : "false");

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

    node.querySelector(".delete-btn").addEventListener("click", () => {
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
  const current = state.filters.finish;
  const uniqueFinishes = [...new Set(state.polishes.map((p) => p.finish))];
  els.finishFilter.innerHTML = `<option value="all">All finishes</option>${uniqueFinishes
    .map((finish) => `<option value="${finish}">${finish}</option>`)
    .join("")}`;
  els.finishFilter.value = uniqueFinishes.includes(current) ? current : "all";
  state.filters.finish = els.finishFilter.value;
}

function renderGeneratorList() {
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

function bindEvents() {
  els.polishForm.addEventListener("submit", onAddPolish);

  els.searchInput.addEventListener("input", (event) => {
    state.filters.search = event.target.value.toLowerCase().trim();
    refresh();
  });

  els.colorFilter.addEventListener("change", (event) => {
    state.filters.color = event.target.value;
    refresh();
  });

  els.finishFilter.addEventListener("change", (event) => {
    state.filters.finish = event.target.value;
    refresh();
  });

  els.favoriteFilter.addEventListener("change", (event) => {
    state.filters.favorite = event.target.value;
    refresh();
  });

  els.recentFilter.addEventListener("change", (event) => {
    state.filters.recent = event.target.value;
    refresh();
  });

  els.sortBy.addEventListener("change", (event) => {
    state.filters.sortBy = event.target.value;
    refresh();
  });

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

  els.autoSuggestBtn.addEventListener("click", suggestPolishes);
  els.generateDesignBtn.addEventListener("click", generateDesign);

  els.designStatusFilter.addEventListener("change", (event) => {
    state.designFilters.status = event.target.value;
    refresh();
  });

  els.designFavoriteFilter.addEventListener("change", (event) => {
    state.designFilters.favorite = event.target.value;
    refresh();
  });
}

function refresh() {
  populateFinishFilter();
  renderHeaderStats();
  renderInventory();
  renderGeneratorList();
  renderDesignLibrary();
}

loadState();
bindEvents();
refresh();
