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

// === VARIABLES GLOBALES (AÑADIDO) ===
// Agregadas para soportar paginación y filtrado
let currentProducts = [];
let filteredProducts = [];
let currentPage = 1;
const productsPerPage = 9;
const productsCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000;

// Versión mejorada de la función original con cache y error handling
async function fetchProducts(categoryId = 101) {
  try {
    // Verificar cache primero (AÑADIDO)
    const cacheKey = `products_${categoryId}`;
    const cached = productsCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      currentProducts = cached.data.products || [];
      filteredProducts = [...currentProducts];
      mostrarProductos(filteredProducts.slice(0, productsPerPage));
      setupPagination();
      return;
    }

    // Mostrar loading skeleton (AÑADIDO)
    showLoadingSkeleton();

    // Lógica original
    // Relleno de data para hacer la petición Web - CÓDIGO ORIGINAL
    // URL fija para la categoría 101 de autos
    const url = PRODUCTS_URL + categoryId + EXT_TYPE;
    const resultObj = await getJSONData(url);

    if (resultObj.status === "ok") {
      // Guardar en cache (AÑADIDO)
      productsCache.set(cacheKey, {
        data: resultObj.data,
        timestamp: Date.now(),
      });

      const productos = resultObj.data.products;
      currentProducts = productos;
      filteredProducts = [...productos];

      // Función original mejorada
      mostrarProductos(filteredProducts.slice(0, productsPerPage));
      setupPagination(); // AÑADIDO
    }
  } catch (error) {
    showError("Error al cargar productos"); // AÑADIDO
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
    // generacion de as tarjetas de productos
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
                    <div class="product-meta">
                        <span class="product-category">Auto</span>
                        <span class="product-price">${
                          producto.currency
                        } ${new Intl.NumberFormat("es-UY").format(
      producto.cost
    )}</span>
                    </div>
                    <div class="product-stats">
                        <span class="product-sold">${
                          producto.soldCount
                        } vendidos</span>
                    </div>
                </div>
            </div>
        `;
  });

  document.getElementById("productsContainer").innerHTML = html;
}

// === FUNCIONES DE FILTRADO Y ORDENAMIENTO ===
// AGREGADO: Filtros por precio, marca y modelo con optimización

// Función para aplicar filtros
function applyFilters() {
  let filtered = [...currentProducts];

  // Filtro de precio
  const priceFilter = document.getElementById("priceFilter")?.value;
  if (priceFilter && priceFilter !== "sortFilter") {
    if (priceFilter.includes("-")) {
      const [min, max] = priceFilter
        .split("-")
        .map((p) => parseInt(p.replace(/\D/g, "")));
      filtered = filtered.filter((product) => {
        const price = product.cost;
        if (priceFilter.includes("+")) {
          return price >= min;
        }
        return price >= min && price <= max;
      });
    }
  }

  // Filtro de marca (ejemplo básico)
  const brandFilter = document.getElementById("brandFilter")?.value;
  if (brandFilter) {
    filtered = filtered.filter((product) =>
      product.name.toLowerCase().includes(brandFilter.toLowerCase())
    );
  }

  // Filtro de modelo (ejemplo básico)
  const modelFilter = document.getElementById("modelFilter")?.value;
  if (modelFilter) {
    filtered = filtered.filter((product) =>
      product.name.toLowerCase().includes(modelFilter.toLowerCase())
    );
  }

  filteredProducts = filtered;
  currentPage = 1; // Resetear a primera página
  displayProducts();
  setupPagination();
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
  displayProducts();
  setupPagination();
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
  } else {
    favoriteBtn.textContent = "♥";
    favoriteBtn.style.color = "var(--color-primary-orange)";
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
  if (brandFilter)
    brandFilter.addEventListener("change", debouncedApplyFilters);
  if (modelFilter)
    modelFilter.addEventListener("change", debouncedApplyFilters);
  if (priceFilter)
    priceFilter.addEventListener("change", debouncedApplyFilters);
  if (kilometersFilter)
    kilometersFilter.addEventListener("change", debouncedApplyFilters);
  if (yearFilter) yearFilter.addEventListener("change", debouncedApplyFilters);

  if (clearFiltersBtn) {
    clearFiltersBtn.addEventListener("click", () => {
      // Limpiar todos los filtros
      if (brandFilter) brandFilter.value = "";
      if (modelFilter) modelFilter.value = "";
      if (priceFilter) priceFilter.value = "";
      if (kilometersFilter) kilometersFilter.value = "";
      if (yearFilter) yearFilter.value = "";
      applyFilters(); // Aplicar inmediatamente al limpiar
    });
  }
}

// Función para configurar el avatar del usuario
function setupUserAvatar() {
  const userAvatar = document.getElementById("userAvatar");
  const userData = localStorage.getItem("currentUser");

  if (userData) {
    const user = JSON.parse(userData);
    userAvatar.title = `Usuario: ${user.username}`;

    // Agregar funcionalidad de logout
    userAvatar.addEventListener("click", () => {
      if (confirm("¿Deseas cerrar sesión?")) {
        clearSession();
        redirectToLogin();
      }
    });
  }
}

document.addEventListener("DOMContentLoaded", async function () {
  // Verificar sesión antes de continuar (AÑADIDO)
  if (!checkUserSession()) return;

  try {
    // Configurar filtros (AÑADIDO)
    setupFilters();
    setupUserAvatar();

    // Lógica original de obtención de datos
    await fetchProducts(101);
  } catch (error) {
    showError("Error al inicializar la página");
  }
});
