// Constantes de orden
const ORDER_ASC_BY_NAME = 'AZ';
const ORDER_DESC_BY_NAME = 'ZA';
const ORDER_BY_PROD_COUNT = 'Cant.';

// Estado en memoria de la página
let currentCategoriesArray = []; // Array con todas las categorías
let currentSortCriteria = undefined; // Último criterio de orden aplicado
let minCount = undefined; // Filtro: cantidad mínima de productos
let maxCount = undefined; // Filtro: cantidad máxima de productos

// Referencias globales a sidebar de filtros
let filtersSidebar = null;
let overlay = null;

// === FUNCIONALIDAD ESPECÍFICA DE CATEGORIES ===
function sortCategories(criteria, array) {
  let result = [];

  if (criteria === ORDER_ASC_BY_NAME) {
    // A–Z por nombre
    result = array.sort(function (a, b) {
      if (a.name < b.name) {
        return -1;
      }
      if (a.name > b.name) {
        return 1;
      }
      return 0;
    });
  } else if (criteria === ORDER_DESC_BY_NAME) {
    // Z–A por nombre
    result = array.sort(function (a, b) {
      if (a.name > b.name) {
        return -1;
      }
      if (a.name < b.name) {
        return 1;
      }
      return 0;
    });
  } else if (criteria === ORDER_BY_PROD_COUNT) {
    // Mayor a menor por cantidad de productos
    result = array.sort(function (a, b) {
      let aCount = parseInt(a.productCount);
      let bCount = parseInt(b.productCount);

      if (aCount > bCount) {
        return -1;
      }
      if (aCount < bCount) {
        return 1;
      }
      return 0;
    });
  }
  return result;
}

// ========= NAVEGACIÓN A PRODUCTS POR CAT =========
function setCatID(id) {
  localStorage.setItem('catID', id);
  // Asegurar que no se muestre "todos los productos" cuando se selecciona una categoría
  localStorage.removeItem('showAllProducts');
  window.location = 'products.html';
}

// ========= RENDER DEL LISTADO =========
function showCategoriesList() {
  let htmlContentToAppend = '';

  for (let i = 0; i < currentCategoriesArray.length; i++) {
    let category = currentCategoriesArray[i];

    // Filtros por cantidad de productos (mín / máx)
    if (
      (minCount == undefined ||
        (minCount != undefined && parseInt(category.productCount) >= minCount)) &&
      (maxCount == undefined ||
        (maxCount != undefined && parseInt(category.productCount) <= maxCount))
    ) {
      htmlContentToAppend += `
            <div onclick="setCatID(${category.id})" class="list-group-item list-group-item-action cursor-active">
                <div class="row">
                    <div class="col-3">
                        <img src="${category.imgSrc}" alt="${category.description}" class="img-thumbnail" loading="lazy">
                    </div>
                    <div class="col">
                        <div class="d-flex w-100 justify-content-between">
                            <h4 class="mb-1">${category.name}</h4>
                            <small class="text-muted">${category.productCount} artículos</small>
                        </div>
                        <p class="mb-1">${category.description}</p>
                    </div>
                </div>
            </div>
            `;
    }
  }
  document.getElementById('cat-list-container').innerHTML = htmlContentToAppend;
}

function sortAndShowCategories(sortCriteria, categoriesArray) {
  currentSortCriteria = sortCriteria;

  if (categoriesArray != undefined) {
    currentCategoriesArray = categoriesArray;
  }

  // Ordenar el array actual según el criterio elegido
  currentCategoriesArray = sortCategories(currentSortCriteria, currentCategoriesArray);

  // Mostrar las categorías ordenadas
  showCategoriesList();
}

// ========= INICIALIZACIÓN DOM =========
document.addEventListener('DOMContentLoaded', function (e) {
  // Cargar categorías desde la API
  getJSONData(CATEGORIES_URL).then(function (resultObj) {
    if (resultObj.status === 'ok') {
      currentCategoriesArray = resultObj.data;
      try {
        localStorage.setItem('categoriesArray', JSON.stringify(resultObj.data));
      } catch (e) {}
      showCategoriesList();
    }
  });

  // --- 2) Controles de orden (versión escritorio) ---
  const sortAscBtn = document.getElementById('sortAsc');
  const sortDescBtn = document.getElementById('sortDesc');
  const sortByCountBtn = document.getElementById('sortByCount');

  if (sortAscBtn) {
    sortAscBtn.addEventListener('click', function () {
      sortAndShowCategories(ORDER_ASC_BY_NAME);
    });
  }

  if (sortDescBtn) {
    sortDescBtn.addEventListener('click', function () {
      sortAndShowCategories(ORDER_DESC_BY_NAME);
    });
  }

  if (sortByCountBtn) {
    sortByCountBtn.addEventListener('click', function () {
      sortAndShowCategories(ORDER_BY_PROD_COUNT);
    });
  }

  // --- 3) Filtros de rango (versión escritorio) ---
  const clearRangeFilterBtn = document.getElementById('clearRangeFilter');
  const applyRangeFilterBtn = document.getElementById('rangeFilterCount');
  const rangeMinInput = document.getElementById('rangeFilterCountMin');
  const rangeMaxInput = document.getElementById('rangeFilterCountMax');

  // Botón "Limpiar" filtros de cantidad
  if (clearRangeFilterBtn) {
    clearRangeFilterBtn.addEventListener('click', function () {
      if (rangeMinInput) rangeMinInput.value = '';
      if (rangeMaxInput) rangeMaxInput.value = '';

      minCount = undefined;
      maxCount = undefined;

      showCategoriesList();
    });
  }

  // Botón "Filtrar" por rango de cantidad
  if (applyRangeFilterBtn) {
    applyRangeFilterBtn.addEventListener('click', function () {
      if (rangeMinInput) minCount = rangeMinInput.value;
      if (rangeMaxInput) maxCount = rangeMaxInput.value;

      if (minCount != undefined && minCount != '' && parseInt(minCount) >= 0) {
        minCount = parseInt(minCount);
      } else {
        minCount = undefined;
      }

      if (maxCount != undefined && maxCount != '' && parseInt(maxCount) >= 0) {
        maxCount = parseInt(maxCount);
      } else {
        maxCount = undefined;
      }

      showCategoriesList();
    });
  }

  // ========= FILTROS MÓVILES (SIDEBAR) =========
  // Referencias globales al sidebar y overlay
  filtersSidebar = document.getElementById('filtersSidebar');
  overlay = document.getElementById('overlay');

  const filtersLabel = document.querySelector('.filters-right > .filters-label:first-child');

  // Abrir sidebar de filtros al hacer click en "Filtros"
  if (filtersLabel && filtersSidebar && overlay) {
    filtersLabel.addEventListener('click', function () {
      filtersSidebar.classList.remove('hidden');
      filtersSidebar.classList.add('show');
      overlay.classList.remove('hidden');
    });
  }

  // Cerrar sidebar al hacer click en el overlay
  if (overlay && filtersSidebar) {
    overlay.addEventListener('click', function () {
      filtersSidebar.classList.remove('show');
      overlay.classList.add('hidden');
      setTimeout(() => {
        filtersSidebar.classList.add('hidden');
      }, 300);
    });
  }

  // Eventos para filtros móviles (sidebar)
  const sortAscMobileBtn = document.getElementById('sortAscMobile');
  const sortDescMobileBtn = document.getElementById('sortDescMobile');
  const sortByCountMobileBtn = document.getElementById('sortByCountMobile');
  const clearRangeFilterMobileBtn = document.getElementById('clearRangeFilterMobile');
  const applyRangeFilterMobileBtn = document.getElementById('rangeFilterCountMobile');
  const rangeMinMobile = document.getElementById('rangeFilterCountMinMobile');
  const rangeMaxMobile = document.getElementById('rangeFilterCountMaxMobile');

  // Helpers locales para cerrar el sidebar
  function closeFiltersSidebarSafe() {
    if (!filtersSidebar || !overlay) return;
    filtersSidebar.classList.remove('show');
    overlay.classList.add('hidden');
    setTimeout(() => filtersSidebar.classList.add('hidden'), 300);
  }

  // Orden A–Z (mobile)
  if (sortAscMobileBtn) {
    sortAscMobileBtn.addEventListener('click', function () {
      sortAndShowCategories(ORDER_ASC_BY_NAME);
      closeFiltersSidebarSafe();
    });
  }

  // Orden Z–A (mobile)
  if (sortDescMobileBtn) {
    sortDescMobileBtn.addEventListener('click', function () {
      sortAndShowCategories(ORDER_DESC_BY_NAME);
      closeFiltersSidebarSafe();
    });
  }

  // Orden por cantidad (mobile)
  if (sortByCountMobileBtn) {
    sortByCountMobileBtn.addEventListener('click', function () {
      sortAndShowCategories(ORDER_BY_PROD_COUNT);
      closeFiltersSidebarSafe();
    });
  }

  // Limpiar filtros de rango (mobile)
  if (clearRangeFilterMobileBtn) {
    clearRangeFilterMobileBtn.addEventListener('click', function () {
      if (rangeMinMobile) rangeMinMobile.value = '';
      if (rangeMaxMobile) rangeMaxMobile.value = '';

      minCount = undefined;
      maxCount = undefined;

      showCategoriesList();
      closeFiltersSidebarSafe();
    });
  }

  // Aplicar filtros de rango (mobile)
  if (applyRangeFilterMobileBtn) {
    applyRangeFilterMobileBtn.addEventListener('click', function () {
      if (rangeMinMobile) minCount = rangeMinMobile.value;
      if (rangeMaxMobile) maxCount = rangeMaxMobile.value;

      if (minCount != undefined && minCount != '' && parseInt(minCount) >= 0) {
        minCount = parseInt(minCount);
      } else {
        minCount = undefined;
      }

      if (maxCount != undefined && maxCount != '' && parseInt(maxCount) >= 0) {
        maxCount = parseInt(maxCount);
      } else {
        maxCount = undefined;
      }

      showCategoriesList();
      closeFiltersSidebarSafe();
    });
  }
});
