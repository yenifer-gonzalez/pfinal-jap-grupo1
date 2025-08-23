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

  const user = getCurrentUser();
  usernameDisplay.textContent = user?.username;
}

function setupLogout() {
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", function (e) {
      e.preventDefault();
      if (confirm("¿Estás seguro de que deseas cerrar sesión?")) {
        logout();
      }
    });
  }
}

// Función para verificar sesión activa
function checkUserSession() {
  const user = localStorage.getItem("currentUser");
  const sessionExpiry = localStorage.getItem("sessionExpiry");

  if (!user || !sessionExpiry) {
    redirectToLogin();
    return false;
  }

  const now = new Date().getTime();
  if (now >= parseInt(sessionExpiry)) {
    // Sesión expirada
    clearSession();
    redirectToLogin();
    return false;
  }

  return true;
}

// Función para limpiar sesión
function clearSession() {
  localStorage.removeItem("currentUser");
  localStorage.removeItem("sessionExpiry");
}

// Función para redireccionar al login
function redirectToLogin() {
  window.location.href = "login.html";
}

// === VARIABLES GLOBALES ===
// Agregadas para soportar paginación y filtrado
let currentProducts = [];
let filteredProducts = [];
let currentPage = 1;
const productsPerPage = 9;
const productsCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000;

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
  const brandFilter = document.getElementById("brandFilter");
  if (brandFilter) {
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
    if (currentValue && brands.has(currentValue)) {
      brandFilter.value = currentValue;
    }
  }

  // Poblar filtro de modelos
  const modelFilter = document.getElementById("modelFilter");
  if (modelFilter) {
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
    if (currentValue && models.has(currentValue)) {
      modelFilter.value = currentValue;
    }
  }
}

// Función para aplicar filtros
function applyFilters() {
  let filtered = [...currentProducts];

  // Filtro de precio
  const priceFilter = document.getElementById("priceFilter")?.value;
  if (priceFilter && priceFilter !== "") {
    if (priceFilter.includes("+")) {
      const min = parseInt(priceFilter.replace(/\D/g, ""));
      filtered = filtered.filter((product) => product.cost >= min);
    } else if (priceFilter.includes("-")) {
      const [min, max] = priceFilter
        .split("-")
        .map((p) => parseInt(p.replace(/\D/g, "")));
      filtered = filtered.filter(
        (product) => product.cost >= min && product.cost <= max
      );
    }
  }

  // Filtro de marca - usa extracción dinámica
  const brandFilter = document.getElementById("brandFilter")?.value;
  if (brandFilter && brandFilter !== "") {
    filtered = filtered.filter((product) => {
      const productBrand = extractBrand(product.name);
      return productBrand === brandFilter;
    });
  }

  // Filtro de modelo - usa extracción dinámica
  const modelFilter = document.getElementById("modelFilter")?.value;
  if (modelFilter && modelFilter !== "") {
    filtered = filtered.filter((product) => {
      const productModel = extractModel(product.name);
      return productModel === modelFilter;
    });
  }

  // Filtros de km y año - mantener como prototipos no funcionales
  const kilometersFilter = document.getElementById("kilometersFilter")?.value;
  const yearFilter = document.getElementById("yearFilter")?.value;

  // Estos filtros no se aplican porque los datos no los contienen
  // Pero se mantienen para futura implementación
  if (kilometersFilter && kilometersFilter !== "") {
    console.log(
      "Filtro de kilómetros seleccionado:",
      kilometersFilter,
      "(No implementado - datos no disponibles)"
    );
  }

  if (yearFilter && yearFilter !== "") {
    console.log(
      "Filtro de año seleccionado:",
      yearFilter,
      "(No implementado - datos no disponibles)"
    );
  }

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
  const brandFilter = document.getElementById("brandFilter");
  const modelFilter = document.getElementById("modelFilter");
  const priceFilter = document.getElementById("priceFilter");
  const kilometersFilter = document.getElementById("kilometersFilter");
  const yearFilter = document.getElementById("yearFilter");
  const clearFiltersBtn = document.getElementById("clearFilters");

  // Usar debounce para optimizar performance
  const debouncedApplyFilters = debounce(applyFilters, 300);

  // Agregar event listeners a todos los filtros
  if (brandFilter) {
    brandFilter.addEventListener("change", () => {
      debouncedApplyFilters();
      // Actualizar modelos cuando cambie la marca
      updateModelFilter();
    });
  }

  if (modelFilter) {
    modelFilter.addEventListener("change", debouncedApplyFilters);
  }

  if (priceFilter) {
    priceFilter.addEventListener("change", debouncedApplyFilters);
  }

  // Filtros de km y año - solo visual, no funcionales
  if (kilometersFilter) {
    kilometersFilter.addEventListener("change", (e) => {
      if (e.target.value) {
        console.log(
          `Filtro de kilómetros seleccionado: ${e.target.value} (Prototipo - no funcional)`
        );
      }
      debouncedApplyFilters();
    });
  }

  if (yearFilter) {
    yearFilter.addEventListener("change", (e) => {
      if (e.target.value) {
        console.log(
          `Filtro de año seleccionado: ${e.target.value} (Prototipo - no funcional)`
        );
      }
      debouncedApplyFilters();
    });
  }

  if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener("click", () => {
      // Limpiar todos los filtros
      if (brandFilter) brandFilter.value = "";
      if (modelFilter) modelFilter.value = "";
      if (priceFilter) priceFilter.value = "";
      if (kilometersFilter) kilometersFilter.value = "";
      if (yearFilter) yearFilter.value = "";

      // Repoblar filtros con todos los datos
      populateFilters();
      applyFilters(); // Aplicar inmediatamente al limpiar
    });
  }
}

// Función para actualizar filtro de modelos basado en marca seleccionada
function updateModelFilter() {
  const brandFilter = document.getElementById("brandFilter");
  const modelFilter = document.getElementById("modelFilter");

  if (!brandFilter || !modelFilter) return;

  const selectedBrand = brandFilter.value;
  const models = new Set();

  // Filtrar productos por marca seleccionada y extraer modelos
  currentProducts.forEach((product) => {
    const productBrand = extractBrand(product.name);
    if (!selectedBrand || productBrand === selectedBrand) {
      const model = extractModel(product.name);
      if (model) models.add(model);
    }
  });

  // Actualizar opciones del filtro de modelo
  const currentValue = modelFilter.value;
  modelFilter.innerHTML = '<option value="">Modelo</option>';

  Array.from(models)
    .sort()
    .forEach((model) => {
      const option = document.createElement("option");
      option.value = model;
      option.textContent = model.charAt(0).toUpperCase() + model.slice(1);
      modelFilter.appendChild(option);
    });

  // Restaurar valor si sigue siendo válido
  if (currentValue && models.has(currentValue)) {
    modelFilter.value = currentValue;
  }
}

document.addEventListener("DOMContentLoaded", async function () {
  // Verificar sesión antes de continuar
  if (!checkUserSession()) return;

  try {
    // Inicialización de dropdown
    updateUserInterface();
    setupLogout();

    // Configurar filtros
    setupFilters();

    // Lógica original de obtención de datos
    await fetchProducts(101);
  } catch (error) {
    showError("Error al inicializar la página");
  }
});
