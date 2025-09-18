// === GESTIÓN DE SESIÓN Y SEGURIDAD ===

function updateUserInterface() {
  const usernameDisplay = document.getElementById("usernameDisplay");
  const sidebarUsername = document.getElementById("sidebarUsername");
  const user = getCurrentUser();

  const name = user?.username || "";
  if (usernameDisplay) usernameDisplay.textContent = name;
  if (sidebarUsername) sidebarUsername.textContent = name;
}

function setupLogout() {
  const logoutButtons = document.querySelectorAll("[data-logout], #logoutBtn");
  const navSidebar = document.getElementById("navSidebar");
  const overlay = document.getElementById("overlay");

  logoutButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      if (confirm("¿Estás seguro de que deseas cerrar sesión?")) {
        // cerrar UI
        if (navSidebar) navSidebar.classList.remove("show");
        if (overlay) overlay.classList.add("hidden");
        logout();
      }
    });
  });
}

// === VARIABLES GLOBALES ===
// Agregadas para soportar paginación y filtrado
let currentProducts = [];
let filteredProducts = [];
let currentPage = 1;
const productsPerPage = 9;
const productsCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000;

// --- BRIDGE ---
// "Puente" para que los selects del sidebar mobile y los de desktop
// se mantengan sincornizados y se pueda utilizar la misma lógica de applyFilters().
let FILTERS = null; // variable para guardar las referencias de todos los controles.

function collectFilters() {
  // buscar por ID cada par de selects/buttons.
  const $ = (id) => document.getElementById(id);
  return {
    search: [$("searchFilter"), $("searchFilterM")].filter(Boolean),
    brand: [$("brandFilter"), $("brandFilterM")].filter(Boolean),
    model: [$("modelFilter"), $("modelFilterM")].filter(Boolean),
    minPrice: [$("minPriceFilter"), $("minPriceFilterM")].filter(Boolean),
    maxPrice: [$("maxPriceFilter"), $("maxPriceFilterM")].filter(Boolean),
    sort: [$("sortFilter"), $("sortFilterM")].filter(Boolean),
    clear: [$("clearFilters"), $("clearFiltersMobile")].filter(Boolean),
  };
}

// Recorre una lista de elementos y devuelve el primer value no vacio.
const firstVal = (els) => {
  for (const el of els || []) if (el && el.value) return el.value;
  return "";
};

// Copia el valor del elemento que disparó el cambio (source)
// al resto de elementos del mismo grupo (els).
const mirror = (els, source) => {
  (els || []).forEach((el) => {
    if (el && el !== source) el.value = source.value;
  });
};

// Función completa para renderizar página con productos y paginación
function renderPage() {
  const startIndex = (currentPage - 1) * productsPerPage;
  const endIndex = startIndex + productsPerPage;
  const productsToShow = filteredProducts.slice(startIndex, endIndex);

  mostrarProductos(productsToShow);
  setupPagination();
}

// Versión mejorada de la función original con cache y error handling
async function fetchProducts(categoryId = 101) {
  try {
    // Verificar cache primero
    const cacheKey = `products_${categoryId}`;
    const cached = productsCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      currentProducts = cached.data.products || [];
      filteredProducts = [...currentProducts];
      populateFilters(); // AÑADIDO: Poblar filtros con datos
      renderPage();
      return;
    }

    // Mostrar loading skeleton
    showLoadingSkeleton();

    // Lógica original
    // Relleno de data para hacer la petición Web - CÓDIGO ORIGINAL
    // URL fija para la categoría 101 de autos
    const url = PRODUCTS_URL + categoryId + EXT_TYPE;
    const resultObj = await getJSONData(url);

    if (resultObj.status === "ok") {
      const productos = resultObj.data.products;
      currentProducts = productos;
      filteredProducts = [...productos];

      // Guardar en cache
      productsCache.set(cacheKey, {
        data: resultObj.data,
        timestamp: Date.now(),
      });

      populateFilters(); //Poblar filtros con datos reales
      renderPage();
    }
  } catch (error) {
    showError("Error al cargar productos");
  }
}

// Función original mejorada para trabajar con paginación
function mostrarProductos(productos) {
  let html = "";

  // Obtener término de búsqueda para highlighting
  const val = (arr, fallbackId) =>
    FILTERS && arr
      ? firstVal(arr)
      : document.getElementById(fallbackId)?.value || "";

  const search = val(FILTERS?.search, "searchFilter");
  const searchTerm = search && search.trim() !== "" ? search.trim() : null;

  productos.forEach((producto) => {
    // Función para resaltar términos de búsqueda
    const highlightText = (text, term) => {
      if (!term) return text;
      const regex = new RegExp(
        `(${term.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")})`,
        "gi"
      );
      return text.replace(regex, "<mark>$1</mark>");
    };

    // Aplicar highlighting si hay búsqueda
    const highlightedName = highlightText(producto.name, searchTerm);
    const highlightedDescription = highlightText(
      producto.description,
      searchTerm
    );

    // generacion de las tarjetas de productos
    html += `
            <div class="product-card" data-product-id="${
              producto.id
            }" onclick="goToProduct(${producto.id})">
                <div class="product-image">
                    <img src="${producto.image}" alt="${producto.name}" 
                        loading="lazy"
                        onerror="this.src='img/cars_index.jpg'"
                        style="opacity: 0; transition: opacity 0.3s ease;"
                        onload="this.style.opacity='1'">
                    <button class="favorite-btn" onclick="toggleFavorite(event, ${
                      producto.id
                    })">♡</button>
                </div>
                <div class="product-info">
                  <h3 class="product-name">${highlightedName}</h3>
                  <p class="product-description">${highlightedDescription}</p>
                  <div class="product-wrapper">
                    <div class="product-stats">
                      <span class="product-sold">${
                        producto.soldCount
                      } vendidos</span>
                    </div>
                    <div class="product-meta">
                      <span class="product-price">${
                        producto.currency
                      } ${new Intl.NumberFormat("es-UY").format(
      producto.cost
    )}</span>
                    </div>
                  </div>
                </div>
            </div>
        `;
  });

  document.getElementById("productsContainer").innerHTML = html;
}

// === FUNCIONES DE FILTRADO Y ORDENAMIENTO ===
// MEJORADO: Filtros optimizados para trabajar con datos reales de la API

// Función para extraer marca del nombre del producto
function extractBrand(productName) {
  const brands = [
    "chevrolet",
    "fiat",
    "suzuki",
    "peugeot",
    "bugatti",
    "toyota",
    "hyundai",
    "volkswagen",
    "ford",
    "honda",
  ];
  const nameLower = productName.toLowerCase();

  for (const brand of brands) {
    if (nameLower.includes(brand)) {
      return brand;
    }
  }
  return null;
}

// Función para extraer modelo del nombre del producto
function extractModel(productName) {
  // Extraer la segunda palabra como modelo (después de la marca)
  const words = productName.split(" ");
  if (words.length >= 2) {
    return words[1].toLowerCase();
  }
  return null;
}

// Función para poblar filtros dinámicamente basado en productos actuales
function populateFilters() {
  const brands = new Set();
  const models = new Set();

  currentProducts.forEach((product) => {
    const brand = extractBrand(product.name);
    const model = extractModel(product.name);

    if (brand) brands.add(brand);
    if (model) models.add(model);
  });

  // Poblar filtro de marcas
  (FILTERS.brand || []).forEach((brandFilter) => {
    const currentValue = brandFilter.value;
    brandFilter.innerHTML =
      '<option value="" disabled selected hidden>Marca</option>';
    Array.from(brands)
      .sort()
      .forEach((brand) => {
        const option = document.createElement("option");
        option.value = brand;
        option.textContent = brand.charAt(0).toUpperCase() + brand.slice(1);
        brandFilter.appendChild(option);
      });

    // Restaurar valor seleccionado si existía
    if (currentValue && brands.has(currentValue))
      brandFilter.value = currentValue;
  });

  // Poblar filtro de modelos
  (FILTERS.model || []).forEach((modelFilter) => {
    const currentValue = modelFilter.value;
    modelFilter.innerHTML =
      '<option value="" disabled selected hidden>Modelo</option>';

    Array.from(models)
      .sort()
      .forEach((model) => {
        const option = document.createElement("option");
        option.value = model;
        option.textContent = model.charAt(0).toUpperCase() + model.slice(1);
        modelFilter.appendChild(option);
      });

    // Restaurar valor seleccionado si existía
    if (currentValue && models.has(currentValue))
      modelFilter.value = currentValue;
  });
}

// Función para ordenar productos (CONSIGNA PUNTO 2)
function sortProducts(products, sortType) {
  switch (sortType) {
    case "price-asc":
      return products.sort((a, b) => a.cost - b.cost);
    case "price-desc":
      return products.sort((a, b) => b.cost - a.cost);
    case "relevance":
      return products.sort((a, b) => b.soldCount - a.soldCount);
    default:
      return products;
  }
}

// Función para aplicar filtros
function applyFilters() {
  let filtered = [...currentProducts];

  const val = (arr, fallbackId) =>
    FILTERS && arr
      ? firstVal(arr)
      : document.getElementById(fallbackId)?.value || "";

  // Nuevos filtros según consigna
  const search = val(FILTERS?.search, "searchFilter");
  const brand = val(FILTERS?.brand, "brandFilter");
  const model = val(FILTERS?.model, "modelFilter");
  const minPrice = val(FILTERS?.minPrice, "minPriceFilter");
  const maxPrice = val(FILTERS?.maxPrice, "maxPriceFilter");
  const sort = val(FILTERS?.sort, "sortFilter");

  // Filtro de búsqueda (DESAFÍO)
  if (search && search.trim() !== "") {
    const searchTerm = search.toLowerCase().trim();
    filtered = filtered.filter((product) => {
      const nameMatch = product.name.toLowerCase().includes(searchTerm);
      const descriptionMatch = product.description
        .toLowerCase()
        .includes(searchTerm);
      return nameMatch || descriptionMatch;
    });
  }

  // Filtro de precio mínimo y máximo (CONSIGNA PUNTO 2)
  if (minPrice && !isNaN(minPrice)) {
    filtered = filtered.filter((p) => p.cost >= parseInt(minPrice));
  }

  if (maxPrice && !isNaN(maxPrice)) {
    filtered = filtered.filter((p) => p.cost <= parseInt(maxPrice));
  }

  // Filtro de marca - usa extracción dinámica
  if (brand) {
    filtered = filtered.filter((p) => extractBrand(p.name) === brand);
  }

  // Filtro de modelo - usa extracción dinámica
  if (model) {
    filtered = filtered.filter((p) => extractModel(p.name) === model);
  }

  // Aplicar ordenamiento (CONSIGNA PUNTO 2)
  if (sort) {
    filtered = sortProducts(filtered, sort);
  }

  filteredProducts = filtered;
  currentPage = 1;
  renderPage();
}

// === FUNCIONES DE PAGINACIÓN ===

// Función para configurar la paginación
function setupPagination() {
  const totalProducts = filteredProducts.length;
  const totalPages = Math.ceil(totalProducts / productsPerPage);
  const paginationContainer = document.getElementById("pagination");

  if (totalPages <= 1) {
    paginationContainer.innerHTML = "";
    return;
  }

  let paginationHTML = "";

  // Botón anterior
  if (currentPage > 1) {
    paginationHTML += `<button class="pagination-btn" onclick="goToPage(${
      currentPage - 1
    })">←</button>`;
  }

  // Números de página
  const startPage = Math.max(1, currentPage - 2);
  const endPage = Math.min(totalPages, currentPage + 2);

  if (startPage > 1) {
    paginationHTML += `<button class="pagination-btn" onclick="goToPage(1)">1</button>`;
    if (startPage > 2) {
      paginationHTML += `<span class="pagination-dots">...</span>`;
    }
  }

  for (let i = startPage; i <= endPage; i++) {
    const activeClass = i === currentPage ? "active" : "";
    paginationHTML += `<button class="pagination-btn ${activeClass}" onclick="goToPage(${i})">${i}</button>`;
  }

  if (endPage < totalPages) {
    if (endPage < totalPages - 1) {
      paginationHTML += `<span class="pagination-dots">...</span>`;
    }
    paginationHTML += `<button class="pagination-btn" onclick="goToPage(${totalPages})">${totalPages}</button>`;
  }

  // Botón siguiente
  if (currentPage < totalPages) {
    paginationHTML += `<button class="pagination-btn" onclick="goToPage(${
      currentPage + 1
    })">→</button>`;
  }

  paginationContainer.innerHTML = paginationHTML;
}

// Función para ir a una página específica
function goToPage(page) {
  currentPage = page;
  renderPage();
}

// === FUNCIONES DE UTILIDAD ===

// Función debounce para optimizar filtros
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Función para formatear precio
function formatCurrency(amount) {
  return new Intl.NumberFormat("es-UY", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
  }).format(amount);
}

// Función para mostrar errores
function showError(message) {
  const container = document.getElementById("productsContainer");
  container.innerHTML = `<div class="error-state">${message}</div>`;
}

// Función para mostrare el esqueleto de carga
function showLoadingSkeleton() {
  const container = document.getElementById("productsContainer");
  const skeletonHTML = Array(6)
    .fill()
    .map(
      () => `
        <div class="skeleton-card">
            <div class="skeleton skeleton-image"></div>
            <div class="skeleton-content">
                <div class="skeleton skeleton-title"></div>
                <div class="skeleton skeleton-text"></div>
                <div class="skeleton skeleton-text"></div>
            </div>
        </div>
    `
    )
    .join("");

  container.innerHTML = skeletonHTML;
}

// === FUNCIONES DE INTERACCIÓN ===

// Función para ir a la página de detalle del producto
function goToProduct(productId) {
  // Guardar el ID del producto para la próxima página
  localStorage.setItem("selectedProduct", productId);
  window.location.href = "product-info.html";
}

// Función para alternar favorito
function toggleFavorite(event, productId) {
  event.stopPropagation(); // Evitar que se active el click del card

  const favoriteBtn = event.target;
  const isFavorite = favoriteBtn.textContent === "♥";

  if (isFavorite) {
    favoriteBtn.textContent = "♡";
    favoriteBtn.style.color = "";
    favoriteBtn.classList.remove("toggle-fav");
  } else {
    favoriteBtn.textContent = "♥";
    favoriteBtn.style.color = "var(--color-primary-orange)";
    favoriteBtn.classList.add("toggle-fav");
  }

  // Aquí podrías guardar los favoritos en localStorage o enviar al servidor
}

// === FUNCIONES DE CONFIGURACIÓN ===

// Función para configurar los filtros
function setupFilters() {
  const debouncedApply = debounce(applyFilters, 250);

  // Búsqueda (DESAFÍO)
  (FILTERS.search || []).forEach((el) =>
    el.addEventListener("input", (e) => {
      mirror(FILTERS.search, e.target);
      debouncedApply();
    })
  );

  // Precio mínimo (CONSIGNA PUNTO 2)
  (FILTERS.minPrice || []).forEach((el) =>
    el.addEventListener("input", (e) => {
      mirror(FILTERS.minPrice, e.target);
      debouncedApply();
    })
  );

  // Precio máximo (CONSIGNA PUNTO 2)
  (FILTERS.maxPrice || []).forEach((el) =>
    el.addEventListener("input", (e) => {
      mirror(FILTERS.maxPrice, e.target);
      debouncedApply();
    })
  );

  // Ordenamiento (CONSIGNA PUNTO 2)
  (FILTERS.sort || []).forEach((el) =>
    el.addEventListener("change", (e) => {
      mirror(FILTERS.sort, e.target);
      debouncedApply();
    })
  );

  // Marca
  (FILTERS.brand || []).forEach((el) =>
    el.addEventListener("change", (e) => {
      mirror(FILTERS.brand, e.target);
      updateModelFilter();
      debouncedApply();
    })
  );

  // Modelo
  (FILTERS.model || []).forEach((el) =>
    el.addEventListener("change", (e) => {
      mirror(FILTERS.model, e.target);
      debouncedApply();
    })
  );

  // Limpiar (los dos botones) - ACTUALIZADO para nuevos filtros
  (FILTERS.clear || []).forEach((btn) =>
    btn.addEventListener("click", () => {
      [
        ...FILTERS.search,
        ...FILTERS.minPrice,
        ...FILTERS.maxPrice,
        ...FILTERS.sort,
        ...FILTERS.brand,
        ...FILTERS.model,
      ].forEach((el) => el && (el.value = ""));
      populateFilters();
      applyFilters();
    })
  );
}

// Función para actualizar filtro de modelos basado en marca seleccionada
function updateModelFilter() {
  const selectedBrand = firstVal(FILTERS.brand);
  const models = new Set();

  currentProducts.forEach((p) => {
    const b = extractBrand(p.name);
    if (!selectedBrand || b === selectedBrand) {
      const m = extractModel(p.name);
      if (m) models.add(m);
    }
  });

  (FILTERS.model || []).forEach((modelFilter) => {
    const prev = modelFilter.value;
    modelFilter.innerHTML = '<option value="">Modelo</option>';
    Array.from(models)
      .sort()
      .forEach((m) => {
        const opt = document.createElement("option");
        opt.value = m;
        opt.textContent = m.charAt(0).toUpperCase() + m.slice(1);
        modelFilter.appendChild(opt);
      });
    modelFilter.value = prev && models.has(prev) ? prev : "";
  });
}

document.addEventListener("DOMContentLoaded", async function () {
  // Session control is handled globally by init.js

  try {
    // Inicialización de dropdown
    updateUserInterface();
    setupLogout();

    // Configurar filtros
    FILTERS = collectFilters();
    setupFilters();

    // CAMBIO: Ahora se obtiene el id de categoría desde localStorage (clave 'catID')
    // Esto permite que el listado de productos se adapte a la categoría seleccionada por el usuario.
    // Si no existe, se usa 101 como valor por defecto (autos).
    let categoryId = localStorage.getItem("catID");
    if (!categoryId) {
      // Si no existe, usar 101 como fallback
      categoryId = 101;
    }
    // === CAMBIO: Actualización dinámica del título de la categoría ===
    // 1. Se obtiene el elemento del título de la categoría (h1 con id 'categoryTitle').
    // 2. Se intenta recuperar el nombre de la categoría desde un array guardado en localStorage ('categoriesArray'),
    //    que debería contener todas las categorías disponibles (esto lo puede guardar categories.js al cargar las categorías).
    // 3. Si se encuentra la categoría por id, se usa su nombre real.
    // 4. Si no se encuentra, se usan nombres por defecto para los ids conocidos (101, 102, 103),
    //    y para cualquier otro id se muestra 'Categoría <id>' como fallback.
    // 5. Finalmente, se actualiza el texto del título en la página para reflejar la categoría seleccionada.
    const categoryTitle = document.getElementById("categoryTitle");
    let categoryName = "";
    try {
      const categoriesRaw = localStorage.getItem("categoriesArray");
      if (categoriesRaw) {
        const categories = JSON.parse(categoriesRaw);
        // Buscar el nombre de la categoría por id (comparando como string para evitar errores de tipo)
        const found = categories.find(
          (cat) => String(cat.id) === String(categoryId)
        );
        if (found && found.name) categoryName = found.name;
      }
    } catch (e) {}
    // Si no se encuentra el nombre, mostrar 'Otros'
    if (!categoryName) {
      categoryName = "Otros";
    }
    if (categoryTitle) categoryTitle.textContent = categoryName;

    await fetchProducts(categoryId);
  } catch (error) {
    showError("Error al inicializar la página");
  }
});
