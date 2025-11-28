// ========= FUNCIONALIDAD ESPECÍFICA DE INDEX =========

// Estado del carousel - Vistos recientemente
let carouselPosition = 0;

function goToCategory(catId) {
  try {
    localStorage.setItem('catID', catId);
    // Asegurar de que no haya flag de "mostrar todos"
    localStorage.removeItem('showAllProducts');
  } catch (e) {
    console.error('No se pudo guardar catID en localStorage:', e);
  }
}

// ========= INICIALIZACIÓN DOM =========
document.addEventListener('DOMContentLoaded', function () {
  // Cards de categorías destacadas
  const autosCard = document.getElementById('autos');
  const juguetesCard = document.getElementById('juguetes');
  const mueblesCard = document.getElementById('muebles');

  // Asignar listeners solo si el elemento existe
  if (autosCard) {
    autosCard.addEventListener('click', function (e) {
      e.preventDefault();
      goToCategory(101);
      window.location.href = 'products.html';
    });
  }

  if (juguetesCard) {
    juguetesCard.addEventListener('click', function (e) {
      e.preventDefault();
      goToCategory(102);
      window.location.href = 'products.html';
    });
  }

  if (mueblesCard) {
    mueblesCard.addEventListener('click', function (e) {
      e.preventDefault();
      goToCategory(103);
      window.location.href = 'products.html';
    });
  }

  // Cargar productos vistos recientemente (si existen en localStorage)
  loadRecentlyViewed();
});

// Carga productos vistos recientemente desde localStorage y muestra/oculta la sección según haya datos o no
function loadRecentlyViewed() {
  const section = document.getElementById('recentlyViewedSection');
  if (!section) return;

  try {
    const stored = localStorage.getItem('recentlyViewed');
    const recentlyViewed = stored ? JSON.parse(stored) : [];

    // Si no hay productos, ocultar la sección
    if (!Array.isArray(recentlyViewed) || recentlyViewed.length === 0) {
      section.style.display = 'none';
      return;
    }

    // Mostrar la sección
    section.style.display = 'block';

    // Renderizar productos
    renderRecentlyViewed(recentlyViewed);

    // Configurar botones del carousel
    setupCarouselButtons(recentlyViewed.length);
  } catch (e) {
    console.error('Error cargando productos vistos recientemente:', e);
    // Si hay error en el JSON, se oculta la sección
    section.style.display = 'none';
  }
}

// Renderiza las cards de productos "Vistos recientemente" dentro del track
function renderRecentlyViewed(products) {
  const track = document.getElementById('recentlyViewedTrack');
  if (!track) return;

  track.innerHTML = products
    .map(
      (product) => `
    <a href="product-info.html" class="recent-product-card" data-product-id="${product.id}">
      <div class="recent-product-image">
        <img src="${product.image}" alt="${product.name}" loading="lazy">
      </div>
      <div class="recent-product-info">
        <h3 class="recent-product-name">${product.name}</h3>
        <p class="recent-product-category">${product.category}</p>
        <p class="recent-product-price">${product.currency} ${product.cost.toLocaleString()}</p>
      </div>
    </a>
  `
    )
    .join('');

  // Agregar event listeners para cada tarjeta
  track.querySelectorAll('.recent-product-card').forEach((card) => {
    card.addEventListener('click', (e) => {
      e.preventDefault();
      const productId = card.getAttribute('data-product-id');

      try {
        localStorage.setItem('selectedProduct', productId);
      } catch (err) {
        console.error('No se pudo guardar selectedProduct en localStorage:', err);
      }

      window.location.href = 'product-info.html';
    });
  });
}

// Función para configurar los botones del carousel
function setupCarouselButtons(totalProducts) {
  const prevBtn = document.getElementById('recentPrevBtn');
  const nextBtn = document.getElementById('recentNextBtn');
  const track = document.getElementById('recentlyViewedTrack');

  // Si falta algo del carousel
  if (!prevBtn || !nextBtn || !track) return;

  // Determinar cuántos items se muestran según el ancho de pantalla
  function getItemsPerView() {
    const width = window.innerWidth;
    if (width < 480) return 1;
    if (width < 1024) return 2;
    if (width < 1440) return 3;
    return 4;
  }

  // Aplica el translateX al track según la posición actual del carousel
  function updateCarouselPosition() {
    const itemsPerView = getItemsPerView();
    const firstCard = track.querySelector('.recent-product-card');

    if (!firstCard) return;

    // Obtener el ancho real de una card incluyendo márgenes
    const cardWidth = firstCard.offsetWidth;
    const gap = window.innerWidth < 480 ? 0 : window.innerWidth < 768 ? 12 : 16;

    // Calcular el desplazamiento total
    const offset = -(carouselPosition * (cardWidth + gap));
    track.style.transform = `translateX(${offset}px)`;

    // Deshabilitar botones según posición
    prevBtn.disabled = carouselPosition === 0;
    nextBtn.disabled = carouselPosition >= totalProducts - itemsPerView;
  }

  // Mueve el carousel a la posición anterior o siguiente,
  // respetando los límites (inicio/fin)
  function moveCarousel(direction) {
    const itemsPerView = getItemsPerView();
    if (direction === 'next' && carouselPosition < totalProducts - itemsPerView) {
      carouselPosition++;
      updateCarouselPosition();
    } else if (direction === 'prev' && carouselPosition > 0) {
      carouselPosition--;
      updateCarouselPosition();
    }
  }

  // Click en botones prev/next
  prevBtn.addEventListener('click', () => moveCarousel('prev'));
  nextBtn.addEventListener('click', () => moveCarousel('next'));

  // Actualizar posición en resize para recalcular ancho/gap/items visibles
  window.addEventListener('resize', updateCarouselPosition);

  // Inicializar
  updateCarouselPosition();

  // Configurar swipe para mobile
  setupCarouselSwipe(
    track,
    () => moveCarousel('next'),
    () => moveCarousel('prev')
  );
}

// Swipe izquierda/derecha en el carousel de vistos recientemente
function setupCarouselSwipe(area, onSwipeLeft, onSwipeRight) {
  if (!area) return;

  let startX = 0;
  let startY = 0;
  let dx = 0;
  let dragging = false;
  const THRESHOLD = 50; // Distancia mínima para considerar que hubo swipe

  const getPoint = (e) => ('touches' in e && e.touches[0]) || e;

  const onDown = (e) => {
    const p = getPoint(e);
    startX = p.clientX;
    startY = p.clientY;
    dx = 0;
    dragging = true;
  };

  const onMove = (e) => {
    if (!dragging) return;
    const p = getPoint(e);
    const dy = p.clientY - startY;
    dx = p.clientX - startX;

    // Si el movimiento es mayormente horizontal, se previene el scroll vertical
    if (Math.abs(dx) > Math.abs(dy)) {
      e.preventDefault();
    }
  };

  const onUp = () => {
    if (!dragging) return;
    dragging = false;

    if (Math.abs(dx) > THRESHOLD) {
      if (dx < 0) {
        onSwipeLeft(); // Swipe left - siguiente
      } else {
        onSwipeRight(); // Swipe right - anterior
      }
    }
  };

  // Pointer Events
  if ('PointerEvent' in window) {
    area.addEventListener('pointerdown', onDown);
    area.addEventListener('pointermove', onMove, { passive: false });
    area.addEventListener('pointerup', onUp);
    area.addEventListener('pointercancel', onUp);
    area.addEventListener('pointerleave', onUp);
  } else {
    // Fallback a touch events
    area.addEventListener('touchstart', onDown, { passive: true });
    area.addEventListener('touchmove', onMove, { passive: false });
    area.addEventListener('touchend', onUp);
    area.addEventListener('touchcancel', onUp);
  }
}
