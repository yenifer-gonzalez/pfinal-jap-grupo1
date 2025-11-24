// === VARIABLES GLOBALES ===
let currentProducts = [];
let filteredProducts = [];

// Paginación / infinite scroll
let currentPage = 1;
const productsPerPage = 9;

// Cache en memoria de respuestas de la API
const productsCache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

// === INFINITE SCROLL VARIABLES ===
let isLoadingMore = false;
let intersectionObserver = null;
let loadMoreSentinel = null;

// === BRIDGE FILTROS (desktop + mobile) ===
// "Puente" para que los controles del sidebar mobile y desktop
// se mantengan sincronizados y usen la misma lógica de filtros.
let FILTERS = null;

// Recolecta referencias a todos los controles de filtros
// (desktop y mobile) agrupándolos por tipo.
function collectFilters() {
  const $ = (id) => document.getElementById(id);

  return {
    search: [$('searchFilter'), $('searchFilterM')].filter(Boolean),
    brand: [$('brandFilter'), $('brandFilterM')].filter(Boolean),
    model: [$('modelFilter'), $('modelFilterM')].filter(Boolean),
    minPrice: [$('minPriceFilter'), $('minPriceFilterM')].filter(Boolean),
    maxPrice: [$('maxPriceFilter'), $('maxPriceFilterM')].filter(Boolean),
    sort: [$('sortFilter'), $('sortFilterM')].filter(Boolean),
    clear: [$('clearFilters'), $('clearFiltersMobile')].filter(Boolean),
  };
}

// Devuelve el primer value no vacío de una lista de inputs/selects.
const firstVal = (els) => {
  for (const el of els || []) if (el && el.value) return el.value;
  return '';
};

// Copia el valor del elemento que disparó el cambio (source)
// al resto de elementos del mismo grupo (els).
const mirror = (els, source) => {
  (els || []).forEach((el) => {
    if (el && el !== source) el.value = source.value;
  });
};

// Helper genérico para obtener el valor de un grupo de filtros
// con fallback a un input por ID (por si FILTERS aún no está listo).
const getFilterValue = (group, fallbackId) => {
  if (FILTERS && group) return firstVal(group);
  const el = document.getElementById(fallbackId);
  return el ? el.value : '';
};

// Resalta el término de búsqueda dentro de un texto usando <mark>.
function highlightText(text, term) {
  if (!term || !text) return text;
  const safeTerm = term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`(${safeTerm})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}

// === RENDER PRINCIPAL ===

// Renderiza la página actual de productos con infinite scroll.
function renderPage() {
  const total = filteredProducts.length;
  const container = document.getElementById('productsContainer');

  if (!container) return;

  // Si no hay productos para mostrar con los filtros actuales
  if (total === 0) {
    cleanupInfiniteScroll();

    container.innerHTML = '';

    const emptyState = document.createElement('div');
    emptyState.className = 'end-of-results empty-state';
    emptyState.innerHTML = `
    <div class="text-center py-4">
      <i class="bi bi-search text-muted" style="font-size: 2rem;"></i>
      <p class="mt-2 mb-0">No se encontraron productos para los filtros seleccionados.</p>
    </div>
  `;

    if (container.parentElement) {
      container.parentElement.appendChild(emptyState);
    }

    const pagination = document.getElementById('pagination');
    if (pagination) pagination.innerHTML = '';
    return;
  }

  const productsToShow = filteredProducts.slice(0, currentPage * productsPerPage);

  mostrarProductos(productsToShow);
  setupInfiniteScroll();

  const pagination = document.getElementById('pagination');
  if (pagination) pagination.innerHTML = '';
}

// === FETCH DE PRODUCTOS ===

// Obtiene todos los productos de todas las categorías.
// Usa cache en memoria y muestra skeleton mientras carga.
async function fetchAllProducts() {
  try {
    const cacheKey = 'products_all';
    const cached = productsCache.get(cacheKey);

    // Usar cache si sigue vigente
    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      currentProducts = cached.data || [];
      filteredProducts = [...currentProducts];
      populateFilters();
      renderPage();
      return;
    }

    // Mostrar loading skeleton
    showLoadingSkeleton();

    // Obtener todas las categorías del localStorage
    const categoriesRaw = localStorage.getItem('categoriesArray');
    if (!categoriesRaw) {
      showError('Error: No se encontraron categorías');
      return;
    }

    const categories = JSON.parse(categoriesRaw);
    // Pedir productos de todas las categorías en paralelo
    const productPromises = categories.map((cat) => getJSONData(PRODUCTS_URL + cat.id + EXT_TYPE));
    const results = await Promise.all(productPromises);

    let allProducts = [];
    results.forEach((resultObj) => {
      if (resultObj.status === 'ok' && resultObj.data.products) {
        allProducts = allProducts.concat(resultObj.data.products);
      }
    });

    currentProducts = allProducts;
    filteredProducts = [...allProducts];

    // Guardar en cache
    productsCache.set(cacheKey, {
      data: allProducts,
      timestamp: Date.now(),
    });

    populateFilters();
    renderPage();
  } catch (error) {
    showError('Error al cargar productos');
  }
}

// Obtiene los productos de una categoría específica.
async function fetchProducts(categoryId = 101) {
  try {
    const cacheKey = `products_${categoryId}`;
    const cached = productsCache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      currentProducts = cached.data.products || [];
      filteredProducts = [...currentProducts];
      populateFilters();
      renderPage();
      return;
    }

    showLoadingSkeleton();

    const url = PRODUCTS_URL + categoryId + EXT_TYPE;
    const resultObj = await getJSONData(url);

    if (resultObj.status === 'ok') {
      const productos = resultObj.data.products;
      currentProducts = productos;
      filteredProducts = [...productos];

      productsCache.set(cacheKey, {
        data: resultObj.data,
        timestamp: Date.now(),
      });

      populateFilters();
      renderPage();
    } else {
      showError('Error al cargar productos');
    }
  } catch (error) {
    showError('Error al cargar productos');
  }
}

// === RENDER DE CARDS DE PRODUCTOS ===

// Renderiza una lista de productos dentro del contenedor principal
function mostrarProductos(productos) {
  const container = document.getElementById('productsContainer');
  if (!container) return;

  let html = '';

  const search = getFilterValue(FILTERS?.search, 'searchFilter');
  const searchTerm = search && search.trim() !== '' ? search.trim() : null;

  const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
  const favoriteIds = wishlist.map((item) => item.productId);

  productos.forEach((producto) => {
    const highlightedName = highlightText(producto.name, searchTerm);
    const highlightedDescription = highlightText(producto.description, searchTerm);

    html += `
      <div class="product-card" data-product-id="${producto.id}" onclick="goToProduct(${
      producto.id
    })">
        <div class="product-image">
          <img src="${producto.image}" alt="${producto.name}" 
            loading="lazy"
            onerror="this.src='img/cars_index.jpg'"
            style="opacity: 0; transition: opacity 0.3s ease;"
            onload="this.style.opacity='1'">
          <button
            class="favorite-btn ${favoriteIds.includes(producto.id) ? 'toggle-fav' : ''}"
            onclick="toggleFavorite(event, ${producto.id})"
            style="${
              favoriteIds.includes(producto.id) ? 'color: var(--color-primary-orange);' : ''
            }"
          >
            ${favoriteIds.includes(producto.id) ? '♥' : '♡'}
          </button>
        </div>
        <div class="product-info">
          <h3 class="product-name">${highlightedName}</h3>
          <p class="product-description">${highlightedDescription}</p>
          <div class="product-wrapper">
            <div class="product-stats">
              <span class="product-sold">${producto.soldCount} vendidos</span>
            </div>
            <div class="product-meta">
              <span class="product-price">${formatCurrency(producto.cost, producto.currency)}</span>
            </div>
          </div>
        </div>
      </div>
    `;
  });

  container.innerHTML = html;
}

// === FILTRADO Y ORDENAMIENTO ===

// Deriva la "marca" desde el nombre del producto
function extractBrand(productName) {
  if (!productName) return null;
  const words = productName.trim().split(/\s+/);
  return words[0]?.toLowerCase() || null;
}

// Deriva el "modelo" desde el nombre del producto.
function extractModel(productName) {
  if (!productName) return null;
  const words = productName.trim().split(/\s+/);
  return words.length >= 2 ? words[1].toLowerCase() : null;
}

// Pobla dinámicamente los selects de Marca y Modelo
// utilizando los productos actualmente cargados.
function populateFilters() {
  const brands = new Set();
  const models = new Set();

  // Solo generar marcas y modelos en categoría autos (101)
  const currentCat = localStorage.getItem('catID');

  if (currentCat === '101') {
    currentProducts.forEach((product) => {
      const brand = extractBrand(product.name);
      const model = extractModel(product.name);

      if (brand) brands.add(brand);
      if (model) models.add(model);
    });
  }

  // Marcas
  (FILTERS?.brand || []).forEach((brandFilter) => {
    const currentValue = brandFilter.value;
    brandFilter.innerHTML = '<option value="" disabled selected hidden>Marca</option>';

    Array.from(brands)
      .sort()
      .forEach((brand) => {
        const option = document.createElement('option');
        option.value = brand;
        option.textContent = brand.charAt(0).toUpperCase() + brand.slice(1);
        brandFilter.appendChild(option);
      });

    if (currentValue && brands.has(currentValue)) brandFilter.value = currentValue;
  });

  // Modelos
  (FILTERS?.model || []).forEach((modelFilter) => {
    const currentValue = modelFilter.value;
    modelFilter.innerHTML = '<option value="" disabled selected hidden>Modelo</option>';

    Array.from(models)
      .sort()
      .forEach((model) => {
        const option = document.createElement('option');
        option.value = model;
        option.textContent = model.charAt(0).toUpperCase() + model.slice(1);
        modelFilter.appendChild(option);
      });

    if (currentValue && models.has(currentValue)) modelFilter.value = currentValue;
  });
}

// Ordena la lista de productos según el criterio seleccionado
function sortProducts(products, sortType) {
  switch (sortType) {
    case 'price-asc':
      return products.sort((a, b) => a.cost - b.cost);
    case 'price-desc':
      return products.sort((a, b) => b.cost - a.cost);
    case 'relevance':
      return products.sort((a, b) => b.soldCount - a.soldCount);
    default:
      return products;
  }
}

// Aplica todos los filtros (búsqueda, marca, modelo, precio y ordenamiento)
// sobre la lista currentProducts y vuelve a renderizar
function applyFilters() {
  let filtered = [...currentProducts];

  const search = getFilterValue(FILTERS?.search, 'searchFilter');
  const brand = getFilterValue(FILTERS?.brand, 'brandFilter');
  const model = getFilterValue(FILTERS?.model, 'modelFilter');
  const minPrice = getFilterValue(FILTERS?.minPrice, 'minPriceFilter');
  const maxPrice = getFilterValue(FILTERS?.maxPrice, 'maxPriceFilter');
  const sort = getFilterValue(FILTERS?.sort, 'sortFilter');

  // Búsqueda en nombre / descripción
  if (search && search.trim() !== '') {
    const searchTerm = search.toLowerCase().trim();
    filtered = filtered.filter((product) => {
      const nameMatch = product.name.toLowerCase().includes(searchTerm);
      const descriptionMatch = product.description.toLowerCase().includes(searchTerm);
      return nameMatch || descriptionMatch;
    });
  }

  // Precio mínimo / máximo
  if (minPrice && !isNaN(minPrice)) {
    filtered = filtered.filter((p) => p.cost >= parseInt(minPrice));
  }

  if (maxPrice && !isNaN(maxPrice)) {
    filtered = filtered.filter((p) => p.cost <= parseInt(maxPrice));
  }

  // Filtro de marca
  if (brand) {
    filtered = filtered.filter((p) => extractBrand(p.name) === brand);
  }

  // Filtro de modelo
  if (model) {
    filtered = filtered.filter((p) => extractModel(p.name) === model);
  }

  // Ordenamiento
  if (sort) {
    filtered = sortProducts(filtered, sort);
  }

  filteredProducts = filtered;
  currentPage = 1;
  renderPage();
}

// === PAGINACIÓN (solo para reset desde filtros) ===
function goToPage(page) {
  currentPage = page;
  renderPage();

  const container = document.getElementById('productsContainer');
  if (container) {
    container.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }
}

// === INFINITE SCROLL ===

// Configura el IntersectionObserver para cargar más productos
// cuando el usuario llega al final de la lista.
function setupInfiniteScroll() {
  const totalProducts = filteredProducts.length;
  const loadedProducts = currentPage * productsPerPage;

  // Si ya se cargaron todos, limpiar y mostrar mensaje de fin
  if (loadedProducts >= totalProducts) {
    cleanupInfiniteScroll();
    showEndOfResults();
    return;
  }

  // Limpiar observer / sentinel anteriores
  cleanupInfiniteScroll();

  loadMoreSentinel = document.createElement('div');
  loadMoreSentinel.id = 'load-more-sentinel';
  loadMoreSentinel.className = 'load-more-container';
  loadMoreSentinel.innerHTML = `
    <div class="load-more-spinner" role="status" aria-live="polite" aria-busy="true">
      <div class="spinner-border text-primary" role="status">
        <span class="visually-hidden">Cargando más productos...</span>
      </div>
      <p class="mt-2">Cargando más productos...</p>
    </div>
  `;

  const container = document.getElementById('productsContainer');
  if (!container || !container.parentElement) return;

  container.parentElement.appendChild(loadMoreSentinel);

  // Crear Intersection Observer
  intersectionObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !isLoadingMore) {
          loadMoreProducts();
        }
      });
    },
    {
      threshold: 0.1,
      rootMargin: '100px', // Cargar antes de llegar al final
    }
  );

  // Observar el sentinel
  intersectionObserver.observe(loadMoreSentinel);
}

// Carga el siguiente "chunk" de productos
function loadMoreProducts() {
  const totalProducts = filteredProducts.length;
  const loadedProducts = currentPage * productsPerPage;

  if (isLoadingMore || loadedProducts >= totalProducts) return;

  isLoadingMore = true;

  setTimeout(() => {
    currentPage++;

    const startIndex = (currentPage - 1) * productsPerPage;
    const endIndex = startIndex + productsPerPage;
    const newProducts = filteredProducts.slice(startIndex, endIndex);

    appendProducts(newProducts);
    isLoadingMore = false;

    // Verificar si hay más productos
    const newLoadedProducts = currentPage * productsPerPage;
    if (newLoadedProducts >= totalProducts) {
      cleanupInfiniteScroll();
      showEndOfResults();
    }
  }, 300);
}

// Agrega nuevas cards de productos al contenedor existente
function appendProducts(productos) {
  const container = document.getElementById('productsContainer');
  if (!container) return;

  const search = getFilterValue(FILTERS?.search, 'searchFilter');
  const searchTerm = search && search.trim() !== '' ? search.trim() : null;

  const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
  const favoriteIds = wishlist.map((item) => item.productId);

  let html = '';
  productos.forEach((producto) => {
    const highlightedName = highlightText(producto.name, searchTerm);
    const highlightedDescription = highlightText(producto.description, searchTerm);

    html += `
      <div class="product-card" data-product-id="${producto.id}" onclick="goToProduct(${
      producto.id
    })">
        <div class="product-image">
          <img src="${producto.image}" alt="${producto.name}" 
            loading="lazy"
            onerror="this.src='img/cars_index.jpg'"
            style="opacity: 0; transition: opacity 0.3s ease;"
            onload="this.style.opacity='1'">
          <button
            class="favorite-btn ${favoriteIds.includes(producto.id) ? 'toggle-fav' : ''}"
            onclick="toggleFavorite(event, ${producto.id})"
            style="${
              favoriteIds.includes(producto.id) ? 'color: var(--color-primary-orange);' : ''
            }"
          >
            ${favoriteIds.includes(producto.id) ? '♥' : '♡'}
          </button>
        </div>
        <div class="product-info">
          <h3 class="product-name">${highlightedName}</h3>
          <p class="product-description">${highlightedDescription}</p>
          <div class="product-wrapper">
            <div class="product-stats">
              <span class="product-sold">${producto.soldCount} vendidos</span>
            </div>
            <div class="product-meta">
              <span class="product-price">${formatCurrency(producto.cost, producto.currency)}</span>
            </div>
          </div>
        </div>
      </div>
    `;
  });

  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = html;

  Array.from(tempDiv.children).forEach((card, index) => {
    setTimeout(() => {
      card.style.opacity = '0';
      card.style.transform = 'translateY(20px)';
      container.appendChild(card);

      requestAnimationFrame(() => {
        card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
        card.style.opacity = '1';
        card.style.transform = 'translateY(0)';
      });
    }, index * 50);
  });
}

// Función para mostrar mensaje de fin de resultados
function showEndOfResults() {
  const totalProducts = filteredProducts.length;

  // Eliminar mensaje anterior si existe
  const existingMessage = document.querySelector('.end-of-results');
  if (existingMessage) existingMessage.remove();

  const endMessage = document.createElement('div');
  endMessage.className = 'end-of-results';
  endMessage.innerHTML = `
    <div class="text-center py-4">
      <i class="bi bi-check-circle text-success" style="font-size: 2rem;"></i>
      <p class="mt-2 mb-0">Has visto todos los ${totalProducts} productos</p>
    </div>
  `;

  const container = document.getElementById('productsContainer');
  if (container && container.parentElement) {
    container.parentElement.appendChild(endMessage);
  }
}

// Limpia cualquier rastro de infinite scroll:
// observer, sentinel y mensaje de fin
function cleanupInfiniteScroll() {
  if (intersectionObserver) {
    intersectionObserver.disconnect();
    intersectionObserver = null;
  }

  if (loadMoreSentinel) {
    loadMoreSentinel.remove();
    loadMoreSentinel = null;
  }

  // Remover mensaje de fin de resultados
  const endMessage = document.querySelector('.end-of-results');
  if (endMessage) endMessage.remove();
}

// === UTILIDADES ===

// Debounce simple para evitar recalcular filtros en cada pulsación
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

// Formatea un monto según la moneda del producto (usa money() de init.js con símbolo)
function formatCurrency(amount, currency = 'USD') {
  return money(amount, currency, true);
}

// Muestra un estado de error dentro del contenedor de productos
function showError(message) {
  cleanupInfiniteScroll();
  const container = document.getElementById('productsContainer');
  if (!container) return;
  container.innerHTML = `<div class="error-state">${message}</div>`;
}

// Muestra skeletons de carga mientras se obtienen los productos
function showLoadingSkeleton() {
  cleanupInfiniteScroll();
  const container = document.getElementById('productsContainer');
  if (!container) return;

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
    .join('');

  container.innerHTML = skeletonHTML;
}

// === INTERACCIÓN ===

// Navega a la página de detalle de un producto
function goToProduct(productId) {
  // Guardar el ID del producto para la próxima página
  localStorage.setItem('selectedProduct', productId);
  window.location.href = 'product-info.html';
}

// Marca / desmarca un producto como favorito y lo guarda en localStorage
function toggleFavorite(event, productId) {
  event.stopPropagation(); // Evitar que se active el click del card

  const favoriteBtn = event.target;

  // Obtener favoritos actuales del localStorage
  let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];

  // Verificar si el producto YA está en favoritos usando el estado real del localStorage
  const isFavorite = wishlist.some((item) => item.productId === productId);

  if (isFavorite) {
    // Remover de favoritos
    wishlist = wishlist.filter((item) => item.productId !== productId);
    favoriteBtn.textContent = '♡';
    favoriteBtn.style.color = '';
    favoriteBtn.classList.remove('toggle-fav');
  } else {
    // Agregar a favoritos
    const product = currentProducts.find((p) => p.id === productId);
    if (product) {
      wishlist.push({
        productId: product.id,
        name: product.name,
        description: product.description,
        cost: product.cost,
        currency: product.currency,
        image: product.image,
        soldCount: product.soldCount,
        addedAt: new Date().toISOString(),
        priceWhenAdded: product.cost,
      });
    }
    favoriteBtn.textContent = '♥';
    favoriteBtn.style.color = 'var(--color-primary-orange)';
    favoriteBtn.classList.add('toggle-fav');
  }

  // Guardar en localStorage
  localStorage.setItem('wishlist', JSON.stringify(wishlist));
}

// === CONFIGURACIÓN DE FILTROS ===

// Configura listeners de filtros (desktop + mobile) usando el bridge FILTERS
function setupFilters() {
  const debouncedApply = debounce(applyFilters, 250);

  // Búsqueda
  (FILTERS.search || []).forEach((el) =>
    el.addEventListener('input', (e) => {
      mirror(FILTERS.search, e.target);
      debouncedApply();
    })
  );

  // Precio mínimo
  (FILTERS.minPrice || []).forEach((el) =>
    el.addEventListener('input', (e) => {
      mirror(FILTERS.minPrice, e.target);
      debouncedApply();
    })
  );

  // Precio máximo
  (FILTERS.maxPrice || []).forEach((el) =>
    el.addEventListener('input', (e) => {
      mirror(FILTERS.maxPrice, e.target);
      debouncedApply();
    })
  );

  // Ordenamiento
  (FILTERS.sort || []).forEach((el) =>
    el.addEventListener('change', (e) => {
      mirror(FILTERS.sort, e.target);
      debouncedApply();
    })
  );

  // Marca
  (FILTERS.brand || []).forEach((el) =>
    el.addEventListener('change', (e) => {
      mirror(FILTERS.brand, e.target);
      updateModelFilter();
      debouncedApply();
    })
  );

  // Modelo
  (FILTERS.model || []).forEach((el) =>
    el.addEventListener('change', (e) => {
      mirror(FILTERS.model, e.target);
      debouncedApply();
    })
  );

  // Limpiar filtros (botón desktop + mobile)
  (FILTERS.clear || []).forEach((btn) =>
    btn.addEventListener('click', () => {
      [
        ...FILTERS.search,
        ...FILTERS.minPrice,
        ...FILTERS.maxPrice,
        ...FILTERS.sort,
        ...FILTERS.brand,
        ...FILTERS.model,
      ].forEach((el) => el && (el.value = ''));

      populateFilters();
      applyFilters();
    })
  );
}

// Actualiza la lista de modelos disponible según la marca seleccionada
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
        const opt = document.createElement('option');
        opt.value = m;
        opt.textContent = m.charAt(0).toUpperCase() + m.slice(1);
        modelFilter.appendChild(opt);
      });

    modelFilter.value = prev && models.has(prev) ? prev : '';
  });
}

// === INICIALIZACIÓN ===
document.addEventListener('DOMContentLoaded', async function () {
  try {
    // Bridge de filtros (desktop + mobile)
    FILTERS = collectFilters();
    setupFilters();

    // === LÓGICA DE VISTA INICIAL ===
    const showAllProducts = localStorage.getItem('showAllProducts'); // "true" | "false" | null
    let categoryId = localStorage.getItem('catID');

    // Si viene el flag showAllProducts === "true" -> mostrar todos
    // Si NO hay catID guardado -> mostrar todos
    const shouldShowAll = showAllProducts === 'true' || !categoryId;

    if (shouldShowAll) {
      // Limpiar flags solo si se viene explícitamente de "ver todos"
      if (showAllProducts === 'true') {
        localStorage.removeItem('showAllProducts');
        localStorage.removeItem('catID');
      }

      // Título y breadcrumb para Productos
      const categoryTitle = document.getElementById('categoryTitle');
      if (categoryTitle) categoryTitle.textContent = 'Productos';

      const breadcrumbCategory = document.getElementById('breadcrumb-category');
      if (breadcrumbCategory) {
        breadcrumbCategory.innerHTML = `<i class="bi bi-grid"></i> Productos`;
      }

      // Cargar TODOS los productos (todas las categorías)
      await fetchAllProducts();
    } else {
      // === COMPORTAMIENTO ORIGINAL: productos por categoría ===
      const categoryTitle = document.getElementById('categoryTitle');
      let categoryName = '';

      try {
        const categoriesRaw = localStorage.getItem('categoriesArray');
        if (categoriesRaw) {
          const categories = JSON.parse(categoriesRaw);
          const found = categories.find((cat) => String(cat.id) === String(categoryId));
          if (found && found.name) categoryName = found.name;
        }
      } catch (e) {
        // Si falla el parse, se usa el fallback
      }

      if (!categoryName) categoryName = 'Otros';
      if (categoryTitle) categoryTitle.textContent = categoryName;

      // Actualizar breadcrumb con el nombre de la categoría
      const breadcrumbCategory = document.getElementById('breadcrumb-category');
      if (breadcrumbCategory) {
        breadcrumbCategory.innerHTML = `<i class="bi bi-grid"></i> ${categoryName}`;
      }

      await fetchProducts(categoryId);
    }
  } catch (error) {
    showError('Error al inicializar la página');
  }
});
