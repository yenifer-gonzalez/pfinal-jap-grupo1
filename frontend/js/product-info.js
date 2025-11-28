// === FUNCIONALIDAD DE INFORMACIÓN DEL PRODUCTO ===

// Estado galería
const galleryState = { images: [], index: 0, arrowsBound: false };

// Inicializa la galería de imágenes del producto
function setupGallery(images) {
  galleryState.images = Array.isArray(images) ? images : [];
  galleryState.index = 0;

  renderThumbnails();
  setMainImage(0);
  setupArrows();
}

// Setea la imagen principal y actualiza el estado de la miniatura activa
function setMainImage(i) {
  if (!galleryState.images.length) return;

  galleryState.index = (i + galleryState.images.length) % galleryState.images.length;
  const main = document.getElementById('pi-main-image');

  if (main) {
    main.src = galleryState.images[galleryState.index];
    main.alt = `Imagen ${galleryState.index + 1} del producto`;
  }

  // Activar miniatura seleccionada
  const thumbs = document.querySelectorAll('.pi-thumb');
  thumbs.forEach((b, idx) => b.classList.toggle('is-active', idx === galleryState.index));
}

// Dibuja las miniaturas y les asocia el click
function renderThumbnails() {
  const wrap = document.getElementById('pi-thumbs');
  if (!wrap) return;

  wrap.innerHTML = galleryState.images
    .map(
      (src, idx) => `
        <button
          class="pi-thumb${idx === galleryState.index ? ' is-active' : ''}"
          data-index="${idx}"
          type="button"
        >
          <img src="${src}" alt="Miniatura ${idx + 1}" loading="lazy">
        </button>
      `
    )
    .join('');

  wrap.querySelectorAll('.pi-thumb').forEach((btn) => {
    btn.addEventListener('click', () => setMainImage(Number(btn.dataset.index)));
  });
}

// Configura flechas izquierda/derecha de la galería
function setupArrows() {
  if (galleryState.arrowsBound) return;

  const prev = document.querySelector('.pi-carousel-btn.left');
  const next = document.querySelector('.pi-carousel-btn.right');

  if (prev) {
    prev.addEventListener('click', () => setMainImage(galleryState.index - 1));
  }

  if (next) {
    next.addEventListener('click', () => setMainImage(galleryState.index + 1));
  }

  galleryState.arrowsBound = true;
}

// Carrito: agregar productos (+ notificación)
function updateCartWithProduct(product, quantity) {
  const qty = Number.isFinite(quantity) && quantity > 0 ? quantity : 1;

  let cart = JSON.parse(localStorage.getItem('cart')) || [];

  const index = cart.findIndex((item) => item.id === product.id);

  if (index !== -1) {
    cart[index].count = (cart[index].count || 0) + qty;
  } else {
    cart.push({
      id: product.id,
      name: product.name,
      currency: product.currency,
      cost: product.cost,
      image: Array.isArray(product.images) ? product.images[0] : product.image,
      category: (product.category && product.category.name) || product.category || 'Sin categoría',
      count: qty,
    });
  }

  localStorage.setItem('cart', JSON.stringify(cart));

  if (typeof updateCartBadge === 'function') {
    updateCartBadge();
  }
}

// Obtiene la cantidad actual desde el input de cantidad.
function getSelectedQuantity() {
  const qtyInput = document.getElementById('pi-qty');
  return qtyInput ? parseInt(qtyInput.value, 10) || 1 : 1;
}

// Agregar producto al carrito SIN redirigir (botón "Agregar al carrito")
function addToCart(product) {
  const quantity = getSelectedQuantity();
  updateCartWithProduct(product, quantity);
  showCartNotification(product.name);
}

// Agregar producto al carrito Y redirigir (botón "Comprar ahora")
function handleBuyProduct(product) {
  const quantity = getSelectedQuantity();
  updateCartWithProduct(product, quantity);
  window.location.href = 'cart.html';
}

// Notificación flotante al agregar al carrito
function showCartNotification(productName) {
  const notification = document.createElement('div');
  notification.className = 'cart-notification';
  notification.innerHTML = `
    <i class="bi bi-check-circle-fill"></i>
    <span>¡"${productName}" se agregó al carrito!</span>
  `;

  document.body.appendChild(notification);

  // Mostrar con animación
  requestAnimationFrame(() => {
    notification.classList.add('show');
  });

  // Ocultar y eliminar después de 3 segundos
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Carga de producto principal
function localShowError(message) {
  if (typeof window !== 'undefined' && typeof window.showError === 'function') {
    window.showError(message);
    return;
  }

  const container = document.querySelector('.pi-container');
  if (!container) return;

  container.innerHTML = `
    <div class="error-state">
      ${message}
    </div>
  `;
}

// Carga todos los datos de producto desde la API y rellena la UI
async function loadProductInfo() {
  const productId = localStorage.getItem('selectedProduct');
  // Validar si existe un producto seleccionado en el localStorage
  if (!productId) {
    localShowError('No se encontró el producto seleccionado.');
    return;
  }

  // Cargar comentarios en paralelo
  loadProductComments(productId);

  const url = `https://japceibal.github.io/emercado-api/products/${productId}.json`;
  const resultObj = await getJSONData(url);

  if (resultObj.status !== 'ok') {
    localShowError('No se pudo cargar la información del producto');
    return;
  }

  const product = resultObj.data;

  // Título, precio, descripción
  const titleEl = document.getElementById('pi-title');
  const priceEl = document.getElementById('pi-price');
  const descEl = document.getElementById('pi-description');
  const categoryEl = document.getElementById('pi-category');
  const soldEl = document.getElementById('pi-sold');

  if (titleEl) titleEl.textContent = product.name || '';
  if (descEl) descEl.textContent = product.description || '';

  if (priceEl) {
    if (typeof money === 'function') {
      priceEl.textContent = money(product.cost, product.currency);
    } else {
      priceEl.textContent = `${product.currency || ''} ${product.cost ?? ''}`;
    }
  }

  if (categoryEl) {
    categoryEl.textContent = (product.category && product.category.name) || product.category || '';
  }

  if (soldEl) {
    soldEl.textContent = product.soldCount ?? 0;
  }

  // Galería de imágenes
  if (Array.isArray(product.images) && product.images.length > 0) {
    setupGallery(product.images);
  } else {
    setupGallery([]);
  }

  // Encabezado del formulario de reseña
  const reviewName = document.getElementById('review-product-name');
  if (reviewName) reviewName.textContent = product.name || '';

  const reviewThumb = document.querySelector('.review-product-thumb');
  if (reviewThumb) {
    const mainImg =
      (Array.isArray(product.images) && product.images[0]) ||
      product.image ||
      'img/placeholder.jpg';

    reviewThumb.src = mainImg;
    reviewThumb.alt = `Imagen de ${product.name || 'producto'}`;
  }

  // Botones de acciones
  const addToCartButton = document.getElementById('pi-add');
  if (addToCartButton) {
    addToCartButton.addEventListener('click', () => addToCart(product));
  }

  const buyButton = document.getElementById('pi-buy');
  if (buyButton) {
    buyButton.addEventListener('click', () => handleBuyProduct(product));
  }

  // Favoritos
  setupFavoriteButton(product);

  // Vistos recientemente
  addRecentlyViewed(product);

  // Productos relacionados
  renderRelatedProducts(product.relatedProducts);
}

// Swipe izquierda/derecha en la galería
(function enableSwipeOnCarousel() {
  const area = document.querySelector('.pi-carousel');
  if (!area) return;

  let startX = 0;
  let startY = 0;
  let dx = 0;
  let dragging = false;
  const THRESHOLD = 50;

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

    if (Math.abs(dx) > Math.abs(dy)) {
      e.preventDefault();
    }
  };

  const onUp = () => {
    if (!dragging) return;
    dragging = false;

    if (Math.abs(dx) > THRESHOLD) {
      if (dx < 0) {
        setMainImage(galleryState.index + 1);
      } else {
        setMainImage(galleryState.index - 1);
      }
    }
  };

  if ('PointerEvent' in window) {
    area.addEventListener('pointerdown', onDown);
    area.addEventListener('pointermove', onMove, { passive: false });
    area.addEventListener('pointerup', onUp);
    area.addEventListener('pointercancel', onUp);
    area.addEventListener('pointerleave', onUp);
  } else {
    area.addEventListener('touchstart', onDown, { passive: true });
    area.addEventListener('touchmove', onMove, { passive: false });
    area.addEventListener('touchend', onUp);
    area.addEventListener('touchcancel', onUp);
  }
})();

// === Input de cantidad ===
function setupQuantityControls() {
  const minusBtn = document.querySelector('.pi-qty button[aria-label="Disminuir"]');
  const plusBtn = document.querySelector('.pi-qty button[aria-label="Aumentar"]');
  const input = document.getElementById('pi-qty');

  if (!input || !minusBtn || !plusBtn) return;

  const min = parseInt(input.min, 10) || 1;
  const max = parseInt(input.max, 10) || 10;

  minusBtn.addEventListener('click', () => {
    const val = parseInt(input.value, 10) || min;
    if (val > min) input.value = val - 1;
  });

  plusBtn.addEventListener('click', () => {
    const val = parseInt(input.value, 10) || min;
    if (val < max) input.value = val + 1;
  });
}

// Genera HTML de estrellas usando Bootstrap Icons (para opiniones listadas)
function starsHTML(score, max = 5) {
  const rating = Number(score) || 0;
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.5;
  const icons = [];

  for (let i = 1; i <= max; i++) {
    if (i <= full) {
      icons.push('<i class="bi bi-star-fill" aria-hidden="true"></i>');
    } else if (i === full + 1 && hasHalf) {
      icons.push('<i class="bi bi-star-half" aria-hidden="true"></i>');
    } else {
      icons.push('<i class="bi bi-star" aria-hidden="true"></i>');
    }
  }
  return icons.join('');
}

function reviewItemHTML({ user, dateTime, score, description }) {
  const safeUser = user || 'Usuario';
  const safeText = description || '';
  const safeDate = formatDate(dateTime || '', true); // true = formato corto dd/mm/yyyy

  return `
    <article class="review-item">
      <header class="review-header">
        <span class="review-user">${safeUser}</span>
        <time class="review-date" datetime="${dateTime || ''}">${safeDate}</time>
      </header>
      <div class="review-rating" aria-label="Calificación: ${score} de 5">
        ${starsHTML(Number(score) || 0)}
      </div>
      <p class="review-text">${safeText}</p>
    </article>
  `;
}

// Carga y render de comentarios
async function loadProductComments(productId) {
  const list = document.getElementById('reviews-list');
  if (!list) return;

  list.innerHTML = `
    <div class="loading-state">Cargando opiniones…</div>
  `;

  const url = `https://japceibal.github.io/emercado-api/products_comments/${productId}.json`;

  try {
    const resp = await fetch(url);
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const comments = await resp.json();

    if (!Array.isArray(comments) || comments.length === 0) {
      list.innerHTML = `
        <div class="error-state" style="color:var(--text-secondary);">
          Aún no hay opiniones para este producto.
        </div>`;
      return;
    }

    list.innerHTML = comments
      .map((c) =>
        reviewItemHTML({
          user: c.user,
          dateTime: c.dateTime,
          score: c.score,
          description: c.description,
        })
      )
      .join('');
  } catch (err) {
    console.error('Error cargando comentarios:', err);
    list.innerHTML = `
      <div class="error-state">
        No se pudieron cargar las opiniones. Intenta nuevamente más tarde.
      </div>`;
  }
}

// Carga y render de Productos Relacionados
function renderRelatedProducts(relatedProducts) {
  const container = document.getElementById('related-grid');
  if (!container) return;

  container.innerHTML = ''; // Limpiamos contenido previo

  if (!Array.isArray(relatedProducts) || relatedProducts.length === 0) {
    container.innerHTML = '<p class="text-muted">No hay productos relacionados.</p>';
    return;
  }

  relatedProducts.forEach((product) => {
    const card = document.createElement('a');
    card.href = 'product-info.html';
    card.classList.add('related-product-card');
    card.dataset.id = product.id;

    card.innerHTML = `
      <div class="related-product-image">
        <img src="${product.image}" alt="${product.name}" loading="lazy">
      </div>
      <div class="related-product-info">
        <h3 class="related-product-name">${product.name}</h3>
      </div>
    `;

    card.addEventListener('click', (e) => {
      e.preventDefault();
      localStorage.setItem('selectedProduct', product.id);
      window.location.href = 'product-info.html';
    });

    container.appendChild(card);
  });
}

// Sistema de reseñas locales (una reseña por usuario)

function cleanUsername(username) {
  if (!username) return 'Usuario Anónimo';

  // Si contiene @, tomar solo la parte antes del @
  if (username.includes('@')) {
    return username.split('@')[0];
  }
  return username;
}

// Función para verificar si el usuario ya comentó
function hasUserAlreadyReviewed(username) {
  const list = document.getElementById('reviews-list');
  if (!list) return false;

  // Obtener todas las calificaciones existentes
  const existingReviews = list.querySelectorAll('.review-user');

  // Verificar si el usuario ya tiene una calificación
  for (const reviewUser of existingReviews) {
    if (reviewUser.textContent.trim() === username) {
      return true;
    }
  }
  return false;
}

// Configura interacción con las estrellas (Font Awesome)
function setupStarRating() {
  const starButtons = document.querySelectorAll('.star-btn');
  const ratingInput = document.getElementById('rating');

  if (!starButtons.length || !ratingInput) return;

  const totalStars = starButtons.length;

  starButtons.forEach((button, index) => {
    button.type = 'button';

    button.addEventListener('click', function () {
      const rating = totalStars - index;
      ratingInput.value = rating;

      updateStarDisplay(rating);
    });

    button.addEventListener('mouseenter', function () {
      const hoverRating = totalStars - index;
      highlightStars(hoverRating);
    });
  });

  const valoracionDiv = document.querySelector('.valoracion');
  if (valoracionDiv) {
    valoracionDiv.addEventListener('mouseleave', function () {
      const currentRating = parseInt(ratingInput.value) || 0;
      updateStarDisplay(currentRating);
    });
  }
}

function updateStarDisplay(rating) {
  const starButtons = document.querySelectorAll('.star-btn');
  const totalStars = starButtons.length;

  starButtons.forEach((button, index) => {
    const visualPosition = totalStars - index;
    if (visualPosition <= rating) {
      button.classList.add('selected');
    } else {
      button.classList.remove('selected');
    }
  });
}

function highlightStars(rating) {
  const starButtons = document.querySelectorAll('.star-btn');
  const totalStars = starButtons.length;

  starButtons.forEach((button, index) => {
    const visualPosition = totalStars - index;

    if (visualPosition <= rating) {
      button.classList.add('hover');
    } else {
      button.classList.remove('hover');
    }
  });
}

// Configura el submit del formulario de reseña local
function setupReviewForm() {
  const form = document.getElementById('review-form');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault(); // Evitar envío real del formulario

    // Obtener datos del formulario
    const ratingSelect = document.getElementById('rating');
    const commentTextarea = document.getElementById('comment');

    const score = parseInt(ratingSelect.value);
    const description = commentTextarea.value.trim();

    // Validar que se hayan completado los campos
    if (!score || score < 1 || score > 5) {
      alert('Por favor selecciona una calificación de 1 a 5 estrellas.');
      return;
    }

    if (!description) {
      alert('Por favor escribe un comentario sobre el producto.');
      return;
    }

    // Obtener usuario actual de la sesión y limpiar el username
    const currentUser = getCurrentUser();
    const rawUsername = currentUser?.username || 'Usuario Anónimo';
    const username = cleanUsername(rawUsername);

    // Verificar si el usuario ya hizo una calificación
    if (hasUserAlreadyReviewed(username)) {
      alert('Ya has calificado este producto. Solo puedes hacer una calificación por producto.');
      return;
    }

    // Crear fecha actual en formato compatible
    const now = new Date();
    const dateTime = now.toISOString().split('T')[0] + ' ' + now.toTimeString().split(' ')[0];

    // Crear objeto de nueva calificación
    const newReview = {
      user: username,
      dateTime,
      score,
      description,
    };

    addReviewToList(newReview);
    form.reset();
    disableReviewForm('Ya has calificado este producto');
    showSuccessMessage();
  });
}

function disableReviewForm(message) {
  const form = document.getElementById('review-form');
  if (!form) return;

  const ratingSelect = document.getElementById('rating');
  const commentTextarea = document.getElementById('comment');
  const submitBtn = form.querySelector('button[type="submit"]');

  if (ratingSelect) ratingSelect.disabled = true;
  if (commentTextarea) {
    commentTextarea.disabled = true;
    commentTextarea.placeholder = message;
  }
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = 'Ya has calificado';
    submitBtn.style.opacity = '0.6';
    submitBtn.style.cursor = 'not-allowed';
  }
}

function addReviewToList(review) {
  const list = document.getElementById('reviews-list');
  if (!list) return;

  // Verificar si hay mensaje de "no hay opiniones" y eliminarlo
  const emptyState = list.querySelector('.error-state');
  if (emptyState) {
    list.innerHTML = '';
  }

  // Crear el HTML de la nueva calificación usando la función existente
  const reviewHTML = reviewItemHTML(review);

  // Agregar al inicio de la lista (más reciente primero)
  list.insertAdjacentHTML('afterbegin', reviewHTML);

  // Agregar animación de entrada
  const newReviewElement = list.firstElementChild;
  if (newReviewElement) {
    newReviewElement.style.animation = 'fadeIn 0.5s ease-in';
  }
}

function showSuccessMessage() {
  const message = document.createElement('div');
  message.className = 'success-message';
  message.textContent = '✓ Tu calificación ha sido agregada exitosamente';
  message.style.cssText = `
    position: fixed;
    top: 80px;
    left: 50%;
    transform: translateX(-50%);
    background: #4caf50;
    color: white;
    padding: 15px 30px;
    border-radius: 8px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
    z-index: 9999;
    font-weight: 500;
    animation: slideDown 0.3s ease-out;
  `;

  document.body.appendChild(message);

  // Eliminar mensaje después de 3 segundos
  setTimeout(() => {
    message.style.animation = 'fadeOut 0.3s ease-out';
    setTimeout(() => message.remove(), 300);
  }, 3000);
}

// Función para verificar al cargar si el usuario ya comentó
function checkIfUserAlreadyReviewed() {
  setTimeout(() => {
    if (typeof getCurrentUser !== 'function') return;

    const currentUser = getCurrentUser();
    if (!currentUser) return;

    const username = cleanUsername(currentUser.username);

    if (hasUserAlreadyReviewed(username)) {
      disableReviewForm('Ya has calificado este producto');
    }
  }, 1000); // Esperar 1 segundo para que se carguen los comentarios de la API
}

// === SISTEMA DE FAVORITOS ===
function isProductInFavorites(productId) {
  const wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
  return wishlist.some((item) => item.productId == productId);
}

function updateFavoriteButton(productId) {
  const btn = document.getElementById('pi-fav');
  if (!btn) return;

  const isFavorite = isProductInFavorites(productId);

  if (isFavorite) {
    btn.classList.add('active');
    btn.innerHTML = '<i class="bi bi-heart-fill"></i>';
    btn.setAttribute('aria-label', 'Quitar de favoritos');
  } else {
    btn.classList.remove('active');
    btn.innerHTML = '<i class="bi bi-heart"></i>';
    btn.setAttribute('aria-label', 'Agregar a favoritos');
  }
}

function toggleProductFavorite(product) {
  let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
  const isFavorite = wishlist.some((item) => item.productId == product.id);

  if (isFavorite) {
    wishlist = wishlist.filter((item) => item.productId != product.id);
  } else {
    wishlist.push({
      productId: product.id,
      name: product.name,
      description: product.description,
      cost: product.cost,
      currency: product.currency,
      image: product.images[0] || 'img/cars_index.jpg',
      soldCount: product.soldCount,
      addedAt: new Date().toISOString(),
      priceWhenAdded: product.cost,
    });
  }

  localStorage.setItem('wishlist', JSON.stringify(wishlist));
  updateFavoriteButton(product.id);
}

function setupFavoriteButton(product) {
  const btn = document.getElementById('pi-fav');
  if (!btn) return;

  updateFavoriteButton(product.id);

  btn.addEventListener('click', (e) => {
    e.stopPropagation();
    toggleProductFavorite(product);
  });
}

// Vistos recientemente
function addRecentlyViewed(product) {
  if (!product || !product.id) return;

  try {
    const KEY = 'recentlyViewed';
    const MAX = 10;

    const raw = localStorage.getItem(KEY);
    const list = raw ? JSON.parse(raw) : [];

    const filtered = list.filter((p) => String(p.id) !== String(product.id));

    filtered.unshift({
      id: product.id,
      name: product.name,
      image:
        (Array.isArray(product.images) && product.images[0]) ||
        product.image ||
        'img/placeholder.jpg',
      category:
        (product.category && product.category.name) ||
        product.category ||
        product.categoryName ||
        'Otros',
      cost: product.cost ?? 0,
      currency: product.currency || '',
      addedAt: new Date().toISOString(),
    });

    const sliced = filtered.slice(0, MAX);
    localStorage.setItem(KEY, JSON.stringify(sliced));
  } catch (e) {
    console.error('addRecentlyViewed error:', e);
  }
}

// === INICIALIZACIÓN ===

document.addEventListener('DOMContentLoaded', function () {
  loadProductInfo();
  setupQuantityControls();

  // Reseñas locales
  setupStarRating();
  setupReviewForm();
  checkIfUserAlreadyReviewed();
});
