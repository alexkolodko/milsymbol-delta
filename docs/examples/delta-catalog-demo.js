(function () {
  const config = window.DELTA_DEMO_CONFIG || {};
  const state = {
    items: [],
    filteredItems: [],
    page: 1,
    pageSize: 60,
    search: "",
    group: "all",
    geometry: "all",
    diff: "all",
  };

  const caches = {
    base: new Map(),
    patched: new Map(),
  };

  let libraries = {
    base: null,
    patched: null,
  };

  let elements = {};

  function boot() {
    elements = {
      root: document.getElementById("delta-demo"),
      search: document.getElementById("delta-demo-search"),
      group: document.getElementById("delta-demo-group"),
      geometry: document.getElementById("delta-demo-geometry"),
      diff: document.getElementById("delta-demo-diff"),
      pageSize: document.getElementById("delta-demo-page-size"),
      status: document.getElementById("delta-demo-status"),
      stats: document.getElementById("delta-demo-stats"),
      pagination: document.getElementById("delta-demo-pagination"),
      range: document.getElementById("delta-demo-range"),
      prev: document.getElementById("delta-demo-prev"),
      next: document.getElementById("delta-demo-next"),
      table: document.getElementById("delta-demo-table"),
      body: document.getElementById("delta-demo-body"),
      empty: document.getElementById("delta-demo-empty"),
      error: document.getElementById("delta-demo-error"),
      currentPage: document.getElementById("delta-demo-page"),
    };

    attachEvents();
    loadDemo().catch(function (error) {
      showError(error);
    });
  }

  function attachEvents() {
    elements.search.addEventListener("input", function (event) {
      state.search = event.target.value.trim().toLowerCase();
      state.page = 1;
      applyFilters();
    });

    elements.group.addEventListener("change", function (event) {
      state.group = event.target.value;
      state.page = 1;
      applyFilters();
    });

    elements.geometry.addEventListener("change", function (event) {
      state.geometry = event.target.value;
      state.page = 1;
      applyFilters();
    });

    elements.diff.addEventListener("change", function (event) {
      state.diff = event.target.value;
      state.page = 1;
      applyFilters();
    });

    elements.pageSize.addEventListener("change", function (event) {
      state.pageSize = Number(event.target.value);
      state.page = 1;
      render();
    });

    elements.prev.addEventListener("click", function () {
      if (state.page > 1) {
        state.page -= 1;
        render();
      }
    });

    elements.next.addEventListener("click", function () {
      if (state.page < getPageCount()) {
        state.page += 1;
        render();
      }
    });
  }

  async function loadDemo() {
    setStatus("Loading milsymbol libraries and Delta catalog...");

    const [baseLibrary, patchedLibrary, catalog] = await Promise.all([
      loadLibrary(config.baseScripts, "base"),
      loadLibrary(config.patchedScripts, "patched"),
      loadCatalog(config.catalogPath),
    ]);

    libraries.base = baseLibrary;
    libraries.patched = patchedLibrary;
    state.items = flattenCatalog(catalog);

    populateFilters(state.items);
    applyFilters();
    setStatus("Ready.");
  }

  function loadCatalog(path) {
    return fetch(path).then(function (response) {
      if (!response.ok) {
        throw new Error("Unable to load catalog data from " + path);
      }

      return response.json();
    });
  }

  function loadLibrary(scriptPaths, label) {
    return new Promise(function (resolve, reject) {
      const frame = document.createElement("iframe");
      frame.className = "delta-demo__frames";
      frame.title = label + " milsymbol frame";
      document.body.appendChild(frame);

      const frameDocument = frame.contentDocument;
      const frameWindow = frame.contentWindow;

      frameDocument.open();
      frameDocument.write("<!doctype html><html><head></head><body></body></html>");
      frameDocument.close();

      loadScriptsSequentially(frameDocument, scriptPaths.slice())
        .then(function () {
          if (!frameWindow.ms || !frameWindow.ms.Symbol) {
            throw new Error("milsymbol global was not created in the " + label + " frame");
          }

          resolve(frameWindow.ms);
        })
        .catch(reject);
    });
  }

  function loadScriptsSequentially(frameDocument, scriptPaths) {
    return scriptPaths.reduce(function (chain, path) {
      return chain.then(function () {
        return new Promise(function (resolve, reject) {
          const script = frameDocument.createElement("script");
          script.src = path;
          script.onload = resolve;
          script.onerror = function () {
            reject(new Error("Unable to load script " + path));
          };
          frameDocument.head.appendChild(script);
        });
      });
    }, Promise.resolve());
  }

  function flattenCatalog(catalog) {
    const flattened = [];

    Object.keys(catalog).forEach(function (groupName) {
      const entries = catalog[groupName];

      entries.forEach(function (entry) {
        flattened.push({
          sidc: entry.sidc,
          group: groupName,
          geometry: simplifyGeometry(entry.GeoJsonGeometryType),
          deltaGeometry: simplifyGeometry(entry.DeltaGeometryType),
          pathLabel: entry.en || entry.uk || "",
          label: simplifyLabel(entry.en || entry.uk || entry.sidc),
        });
      });
    });

    return flattened.sort(function (left, right) {
      if (left.group === right.group) {
        return left.label.localeCompare(right.label);
      }

      return left.group.localeCompare(right.group);
    });
  }

  function simplifyGeometry(value) {
    return String(value || "")
      .replace(/[\[\]'"]/g, "")
      .split(",")
      .map(function (part) {
        return part.trim();
      })
      .filter(Boolean)
      .join(", ");
  }

  function simplifyLabel(pathLabel) {
    const parts = String(pathLabel)
      .split("->")
      .map(function (part) {
        return part.trim();
      })
      .filter(Boolean);

    return parts.length ? parts[parts.length - 1] : String(pathLabel);
  }

  function populateFilters(items) {
    populateSelect(
      elements.group,
      uniqueSortedValues(
        items.map(function (item) {
          return item.group;
        })
      ),
      "All groups"
    );

    populateSelect(
      elements.geometry,
      uniqueSortedValues(
        items.map(function (item) {
          return item.geometry;
        })
      ),
      "All geometries"
    );
  }

  function populateSelect(selectElement, values, allLabel) {
    selectElement.innerHTML = "";

    const allOption = document.createElement("option");
    allOption.value = "all";
    allOption.textContent = allLabel;
    selectElement.appendChild(allOption);

    values.forEach(function (value) {
      const option = document.createElement("option");
      option.value = value;
      option.textContent = value;
      selectElement.appendChild(option);
    });
  }

  function uniqueSortedValues(values) {
    return Array.from(new Set(values.filter(Boolean))).sort(function (left, right) {
      return left.localeCompare(right);
    });
  }

  function applyFilters() {
    const search = state.search;

    state.filteredItems = state.items.filter(function (item) {
      if (state.group !== "all" && item.group !== state.group) {
        return false;
      }

      if (state.geometry !== "all" && item.geometry !== state.geometry) {
        return false;
      }

      if (search) {
        const haystack = [
          item.sidc,
          item.label,
          item.pathLabel,
          item.group,
          item.geometry,
        ]
          .join(" ")
          .toLowerCase();

        if (!haystack.includes(search)) {
          return false;
        }
      }

      if (state.diff === "changed" || state.diff === "same") {
        const diffState = getComparison(item).changed ? "changed" : "same";
        return diffState === state.diff;
      }

      return true;
    });

    render();
  }

  function render() {
    const pageCount = getPageCount();

    if (state.page > pageCount) {
      state.page = Math.max(pageCount, 1);
    }

    const pageItems = getVisibleItems();
    const startIndex = pageItems.length ? (state.page - 1) * state.pageSize + 1 : 0;
    const endIndex = pageItems.length ? startIndex + pageItems.length - 1 : 0;

    elements.body.innerHTML = "";
    elements.empty.hidden = pageItems.length > 0;

    pageItems.forEach(function (item) {
      elements.body.appendChild(renderRow(item));
    });

    elements.stats.textContent =
      state.filteredItems.length.toLocaleString() +
      " visible of " +
      state.items.length.toLocaleString() +
      " catalog entries";
    elements.range.textContent =
      pageItems.length > 0
        ? "Showing " + startIndex + "-" + endIndex
        : "Showing 0 results";
    elements.currentPage.textContent = "Page " + state.page + " of " + pageCount;

    elements.prev.disabled = state.page <= 1;
    elements.next.disabled = state.page >= pageCount;
    elements.pagination.hidden = state.filteredItems.length === 0;
  }

  function getPageCount() {
    return Math.max(Math.ceil(state.filteredItems.length / state.pageSize), 1);
  }

  function getVisibleItems() {
    const start = (state.page - 1) * state.pageSize;
    return state.filteredItems.slice(start, start + state.pageSize);
  }

  function renderRow(item) {
    const comparison = getComparison(item);
    const row = document.createElement("div");
    row.className = "delta-demo__row";

    row.appendChild(renderSidc(item));
    row.appendChild(renderName(item));
    row.appendChild(renderSymbolCell(comparison.base));
    row.appendChild(renderSymbolCell(comparison.patched));
    row.appendChild(renderBadge(comparison.changed));

    return row;
  }

  function renderSidc(item) {
    const cell = document.createElement("div");
    cell.className = "delta-demo__sidc";
    cell.textContent = item.sidc;
    return cell;
  }

  function renderName(item) {
    const cell = document.createElement("div");
    cell.className = "delta-demo__name";

    const label = document.createElement("strong");
    label.textContent = item.label;

    const detail = document.createElement("span");
    detail.className = "delta-demo__secondary";
    detail.textContent = item.group + " | " + item.geometry;

    const path = document.createElement("span");
    path.className = "delta-demo__secondary";
    path.textContent = item.pathLabel;

    cell.appendChild(label);
    cell.appendChild(detail);
    cell.appendChild(path);
    return cell;
  }

  function renderSymbolCell(result) {
    const cell = document.createElement("div");
    cell.className = "delta-demo__symbol-cell";

    const box = document.createElement("div");
    box.className = "delta-demo__symbol";

    if (result.error) {
      box.classList.add("delta-demo__symbol--error");
      box.textContent = "Render error";
      box.title = result.error;
    } else {
      box.innerHTML = result.svg;
    }

    cell.appendChild(box);
    return cell;
  }

  function renderBadge(changed) {
    const cell = document.createElement("div");
    const badge = document.createElement("span");
    badge.className =
      "delta-demo__badge " +
      (changed ? "delta-demo__badge--changed" : "delta-demo__badge--same");
    badge.textContent = changed ? "Changed" : "Same";
    cell.appendChild(badge);
    return cell;
  }

  function getComparison(item) {
    const base = getRenderedSymbol("base", libraries.base, item.sidc);
    const patched = getRenderedSymbol("patched", libraries.patched, item.sidc);

    return {
      base: base,
      patched: patched,
      changed: normalizeMarkup(base.svg) !== normalizeMarkup(patched.svg),
    };
  }

  function getRenderedSymbol(cacheKey, library, sidc) {
    const cache = caches[cacheKey];

    if (cache.has(sidc)) {
      return cache.get(sidc);
    }

    let result;

    try {
      result = {
        svg: new library.Symbol(sidc, {
          size: 56,
          outlineWidth: 1,
          strokeWidth: 2,
        }).asSVG(),
        error: null,
      };
    } catch (error) {
      result = {
        svg: "",
        error: error instanceof Error ? error.message : String(error),
      };
    }

    cache.set(sidc, result);
    return result;
  }

  function normalizeMarkup(markup) {
    return String(markup || "").replace(/\s+/g, " ").trim();
  }

  function setStatus(message) {
    elements.status.textContent = message;
  }

  function showError(error) {
    const message =
      error instanceof Error ? error.message : "Unknown error while loading the demo.";
    elements.error.hidden = false;
    elements.error.textContent =
      message +
      " If you opened this page directly from the filesystem, serve the repository with a simple local HTTP server so the JSON catalog can be fetched.";
    setStatus("Failed to initialize.");
  }

  document.addEventListener("DOMContentLoaded", boot);
})();
