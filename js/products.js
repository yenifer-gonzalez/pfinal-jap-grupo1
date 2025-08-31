// CAMBIOS REALIZADOS:
// - Mantenida la lógica original de fetcheo con getJSONData()
// - Conservada la función mostrarProductos() como base
// - Actualizado el contenedor de "product-list-container" a "productsContainer"
// - Mejorada la estructura HTML de las tarjetas de producto
//
// FUNCIONALIDADES AGREGADAS:
// - Gestión de sesión y seguridad
// - Sistema de paginación completo
// - Filtros avanzados (precio, marca, modelo)
// - Interacciones de usuario (favoritos, click en productos)
// - Optimización de rendimiento con debounce
// - Manejo de estados de carga y errores
// - Formateo profesional de precios

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

// Session control is handled globally by init.js
// Removed redundant session functions

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
    brand: [$("brandFilter"), $("brandFilterM")].filter(Boolean), // filter(Boolean) para quitar nulos si alguno no existe en la página.
    model: [$("modelFilter"), $("modelFilterM")].filter(Boolean),
    price: [$("priceFilter"), $("priceFilterM")].filter(Boolean),
    km: [$("kilometersFilter"), $("kilometersFilterM")].filter(Boolean),
    year: [$("yearFilter"), $("yearFilterM")].filter(Boolean),
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

// ===================================================================
// CAMBIOS REALIZADOS:
// - Mantenida la lógica original de iteración con forEach
// - Conservado el mapeo de datos: producto.name, producto.description, etc.
// - CAMBIADO: Estructura HTML básica por tarjetas
// - CAMBIADO: ID del contenedor de "product-list-container" a "productsContainer"
// - AGREGADO: Clases CSS para estilos
// - AGREGADO: Funcionalidades de click y favoritos
// - AGREGADO: Lazy loading de imágenes
// ===================================================================

// Función original mejorada para trabajar con paginación
function mostrarProductos(productos) {
  let html = "";

  productos.forEach((producto) => {
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
                  <h3 class="product-name">${producto.name}</h3>
                  <p class="product-description">${producto.description}</p>
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

// Función para aplicar filtros
function applyFilters() {
  let filtered = [...currentProducts];

  const val = (arr, fallbackId) =>
    FILTERS && arr
      ? firstVal(arr)
      : document.getElementById(fallbackId)?.value || "";

  const price = val(FILTERS?.price, "priceFilter");
  const brand = val(FILTERS?.brand, "brandFilter");
  const model = val(FILTERS?.model, "modelFilter");
  const km = val(FILTERS?.km, "kilometersFilter");
  const year = val(FILTERS?.year, "yearFilter");

  // Filtro de precio
  if (price) {
    if (price.includes("+")) {
      const min = parseInt(price.replace(/\D/g, ""));
      filtered = filtered.filter((p) => p.cost >= min);
    } else if (price.includes("-")) {
      const [min, max] = price
        .split("-")
        .map((n) => parseInt(n.replace(/\D/g, "")));
      filtered = filtered.filter((p) => p.cost >= min && p.cost <= max);
    }
  }

  // Filtro de marca - usa extracción dinámica
  if (brand) {
    filtered = filtered.filter((p) => extractBrand(p.name) === brand);
  }

  // Filtro de modelo - usa extracción dinámica
  if (model) {
    filtered = filtered.filter((p) => extractModel(p.name) === model);
  }

  // KM y Año
  if (km) console.log("KM:", km, "(no implementado por falta de datos)");
  if (year) console.log("Año:", year, "(no implementado por falta de datos)");

  filteredProducts = filtered;
  currentPage = 1;
  renderPage();
}

// Función para ordenar productos
function sortProducts(products, sortBy) {
  const sorted = [...products];

  switch (sortBy) {
    case "name-asc":
      return sorted.sort((a, b) => a.name.localeCompare(b.name));
    case "name-desc":
      return sorted.sort((a, b) => b.name.localeCompare(a.name));
    case "price-asc":
      return sorted.sort((a, b) => a.cost - b.cost);
    case "price-desc":
      return sorted.sort((a, b) => b.cost - a.cost);
    case "sold-desc":
      return sorted.sort((a, b) => (b.soldCount || 0) - (a.soldCount || 0));
    default:
      return sorted;
  }
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

  // Precio
  (FILTERS.price || []).forEach((el) =>
    el.addEventListener("change", (e) => {
      mirror(FILTERS.price, e.target);
      debouncedApply();
    })
  );

  // KM y Año (placeholder)
  (FILTERS.km || []).forEach((el) =>
    el.addEventListener("change", (e) => {
      mirror(FILTERS.km, e.target);
      debouncedApply();
    })
  );
  (FILTERS.year || []).forEach((el) =>
    el.addEventListener("change", (e) => {
      mirror(FILTERS.year, e.target);
      debouncedApply();
    })
  );

  // Limpiar (los dos botones)
  (FILTERS.clear || []).forEach((btn) =>
    btn.addEventListener("click", () => {
      [
        ...FILTERS.brand,
        ...FILTERS.model,
        ...FILTERS.price,
        ...FILTERS.km,
        ...FILTERS.year,
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

    // Lógica original de obtención de datos
    await fetchProducts(101);
  } catch (error) {
    showError("Error al inicializar la página");
  }
});
