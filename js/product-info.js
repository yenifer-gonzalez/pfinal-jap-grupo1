// === FUNCIONALIDAD ESPECÍFICA DE PRODUCT-INFO ===
// Las funciones updateUserInterface() y setupLogout() están centralizadas en init.js

// === FUNCIONALIDAD DE INFORMACIÓN DEL PRODUCTO ===

// Estado simple de la galería
const galleryState = { images: [], index: 0, arrowsBound: false };

function setupGallery(images) {
  galleryState.images = Array.isArray(images) ? images : [];
  galleryState.index = 0;
  renderThumbnails();
  setMainImage(0);
  setupArrows();
}

// Setea imagen principal y activa la miniatura
function setMainImage(i) {
  if (!galleryState.images.length) return;
  galleryState.index =
    (i + galleryState.images.length) % galleryState.images.length;
  const main = document.getElementById("pi-main-image");
  if (main) main.src = galleryState.images[galleryState.index];

  // activar miniatura seleccionada
  const thumbs = document.querySelectorAll(".pi-thumb");
  thumbs.forEach((b, idx) =>
    b.classList.toggle("is-active", idx === galleryState.index)
  );
}

// Dibuja miniaturas y les agrega click
function renderThumbnails() {
  const wrap = document.getElementById("pi-thumbs");
  if (!wrap) return;

  wrap.innerHTML = galleryState.images
    .map(
      (src, idx) =>
        `<button class="pi-thumb${
          idx === galleryState.index ? " is-active" : ""
        }" data-index="${idx}">
         <img src="${src}" alt="Miniatura ${idx + 1}">
       </button>`
    )
    .join("");

  wrap.querySelectorAll(".pi-thumb").forEach((btn) => {
    btn.addEventListener("click", () =>
      setMainImage(Number(btn.dataset.index))
    );
  });
}

// Flechas izquierda/derecha
function setupArrows() {
  if (galleryState.arrowsBound) return;
  const prev = document.querySelector(".pi-carousel-btn.left");
  const next = document.querySelector(".pi-carousel-btn.right");
  if (prev)
    prev.addEventListener("click", () => setMainImage(galleryState.index - 1));
  if (next)
    next.addEventListener("click", () => setMainImage(galleryState.index + 1));
  galleryState.arrowsBound = true;
}

//  BTN COMPRAR Y CARGAR ELEMENTOS A LOCAL STORAGE

function handleBuyProduct(product) {
  // Obtener el carrito actual del localStorage o crear uno nuevo si no existe
  let cart = JSON.parse(localStorage.getItem('cart')) || [];
  
  // Crear el objeto del producto para el carrito
  const cartItem = {
    id: product.id,
    name: product.name,
    currency: product.currency,
    cost: product.cost,
    image: product.images[0], // Guardamos la primera imagen del producto
    category: (product.category && product.category.name) || product.category || "Sin categoría",
    count: 1 // Cantidad inicial
  };

  // Agregar el producto al carrito
  cart.push(cartItem);
  
  // Guardar el carrito actualizado en localStorage
  localStorage.setItem('cart', JSON.stringify(cart));
  
  // Redirigir al carrito
  window.location.href = 'cart.html';
}

async function loadProductInfo() {
  const productId = localStorage.getItem("selectedProduct");
  // Validar si existe un producto seleccionado en el localStorage
  if (!productId) {
    showError("No se encontró el producto seleccionado.");
    return;
  }

  // CARGAR COMENTARIOS
  loadProductComments(productId);

  const url = `https://japceibal.github.io/emercado-api/products/${productId}.json`;
  const resultObj = await getJSONData(url);

  if (resultObj.status === "ok") {
    // Insertar datos en el HTML
    const product = resultObj.data;
    document.getElementById("pi-title").textContent = product.name;
    document.getElementById(
      "pi-price"
    ).textContent = `${product.currency} ${product.cost}`;
    document.getElementById("pi-description").textContent = product.description;
    // CAMBIO: soportar categoría como objeto o string
    document.getElementById("pi-category").textContent =
      (product.category && product.category.name) || product.category || "";
    document.getElementById("pi-sold").textContent = product.soldCount;
    // Inicializar galería con las imágenes del producto
    setupGallery(product.images);

    // Completar encabezado del formulario de reseña
    const reviewName = document.getElementById("review-product-name");
    if (reviewName) reviewName.textContent = product.name;

    const reviewThumb = document.querySelector(".review-product-thumb");
    
    // Configurar el botón de compra
    const buyButton = document.getElementById('pi-buy');
    if (buyButton) {
      buyButton.addEventListener('click', () => handleBuyProduct(product));
    }
    if (reviewThumb && Array.isArray(product.images) && product.images[0]) {
      reviewThumb.src = product.images[0];
      reviewThumb.alt = `Imagen de ${product.name}`;
    }
    renderRelatedProducts(product.relatedProducts);
  } else {
    showError("No se pudo cargar la información del producto");
  }
}

// Swipe izquierda/derecha en la galería
(function enableSwipeOnCarousel() {
  const area = document.querySelector(".pi-carousel");
  if (!area) return;

  let startX = 0,
    startY = 0,
    dx = 0,
    dragging = false;
  const THRESHOLD = 50;

  const getPoint = (e) => ("touches" in e && e.touches[0]) || e;

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

  if ("PointerEvent" in window) {
    area.addEventListener("pointerdown", onDown);
    area.addEventListener("pointermove", onMove, { passive: false });
    area.addEventListener("pointerup", onUp);
    area.addEventListener("pointercancel", onUp);
    area.addEventListener("pointerleave", onUp);
  } else {
    area.addEventListener("touchstart", onDown, { passive: true });
    area.addEventListener("touchmove", onMove, { passive: false });
    area.addEventListener("touchend", onUp);
    area.addEventListener("touchcancel", onUp);
  }
})();

// === INPUT DE CANTIDAD ===
function setupQuantityControls() {
  const minusBtn = document.querySelector(
    '.pi-qty button[aria-label="Disminuir"]'
  );
  const plusBtn = document.querySelector(
    '.pi-qty button[aria-label="Aumentar"]'
  );
  const input = document.getElementById("pi-qty");

  if (!input) return;

  const min = parseInt(input.min) || 1;
  const max = parseInt(input.max) || 10;

  minusBtn.addEventListener("click", () => {
    let val = parseInt(input.value);
    if (val > min) input.value = val - 1;
  });

  plusBtn.addEventListener("click", () => {
    let val = parseInt(input.value);
    if (val < max) input.value = val + 1;
  });
}

// Estrellas con Bootstrap Icons
function starsHTML(score, max = 5) {
  const full = Math.floor(score);
  const hasHalf = score - full >= 0.5;
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
  return icons.join("");
}

function formatDate(dstr) {
  try {
    const [datePart] = String(dstr).split(" ");
    const [yyyy, mm, dd] = datePart.split("-");
    if (yyyy && mm && dd) return `${dd}/${mm}/${yyyy}`;
  } catch (e) {}
  return dstr || "";
}

function reviewItemHTML({ user, dateTime, score, description }) {
  const safeUser = user || "Usuario";
  const safeText = description || "";
  const safeDate = formatDate(dateTime || "");

  return `
    <article class="review-item">
      <header class="review-header">
        <span class="review-user">${safeUser}</span>
        <time class="review-date" datetime="${
          dateTime || ""
        }">${safeDate}</time>
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
  const list = document.getElementById("reviews-list");
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
      .join("");
  } catch (err) {
    console.error("Error cargando comentarios:", err);
    list.innerHTML = `
      <div class="error-state">
        No se pudieron cargar las opiniones. Intenta nuevamente más tarde.
      </div>`;
  }
}

// Carga y render de Productos Relacionados
function renderRelatedProducts(relatedProducts) {
  const container = document.getElementById("related-grid");
  container.innerHTML = ""; // Limpiamos contenido previo

  relatedProducts.forEach(product => {
    const card = document.createElement("div");
    card.classList.add("related-item");

    card.innerHTML = `
    <a href="product-info.html" data-id="${product.id}">
    <img src="${product.image}" alt="${product.name}">
    <h3 class="related-name">${product.name}</h3>
    </a>
    `;

    card.addEventListener("click", () => {
      localStorage.setItem("selectedProduct", product.id);
      window.location.href = "product-info.html";
    });

    container.appendChild(card);
  });
}

// === DESAFÍO: AGREGAR CALIFICACIÓN LOCALMENTE ===

// Función para limpiar el username (quitar dominio del email)
function cleanUsername(username) {
  if (!username) return "Usuario Anónimo";
  
  // Si contiene @, tomar solo la parte antes del @
  if (username.includes('@')) {
    return username.split('@')[0];
  }
  
  return username;
}

// Función para verificar si el usuario ya comentó
function hasUserAlreadyReviewed(username) {
  const list = document.getElementById("reviews-list");
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

function setupReviewForm() {
  const form = document.getElementById("review-form");
  if (!form) return;

  form.addEventListener("submit", function(e) {
    e.preventDefault(); // Evitar envío real del formulario

    // Obtener datos del formulario
    const ratingSelect = document.getElementById("rating");
    const commentTextarea = document.getElementById("comment");
    
    const score = ratingSelect.value;
    const description = commentTextarea.value.trim();

    // Validar que se hayan completado los campos
    if (!score || !description) {
      alert("Por favor completa todos los campos");
      return;
    }

    // Obtener usuario actual de la sesión y limpiar el username
    const currentUser = getCurrentUser();
    const rawUsername = currentUser?.username || "Usuario Anónimo";
    const username = cleanUsername(rawUsername);

    // Verificar si el usuario ya hizo una calificación
    if (hasUserAlreadyReviewed(username)) {
      alert("Ya has calificado este producto. Solo puedes hacer una calificación por producto.");
      return;
    }

    // Crear fecha actual en formato compatible
    const now = new Date();
    const dateTime = now.toISOString().split('T')[0] + " " + 
                     now.toTimeString().split(' ')[0];

    // Crear objeto de nueva calificación
    const newReview = {
      user: username,
      dateTime: dateTime,
      score: parseInt(score),
      description: description
    };

    // Agregar la calificación a la lista
    addReviewToList(newReview);

    // Limpiar el formulario
    form.reset();

    // Deshabilitar el formulario para evitar múltiples envíos
    disableReviewForm("Ya has calificado este producto");

    // Mostrar mensaje de éxito
    showSuccessMessage();
  });
}

// Función para deshabilitar el formulario después de enviar
function disableReviewForm(message) {
  const form = document.getElementById("review-form");
  if (!form) return;
  
  const ratingSelect = document.getElementById("rating");
  const commentTextarea = document.getElementById("comment");
  const submitBtn = form.querySelector('button[type="submit"]');
  
  if (ratingSelect) ratingSelect.disabled = true;
  if (commentTextarea) {
    commentTextarea.disabled = true;
    commentTextarea.placeholder = message;
  }
  if (submitBtn) {
    submitBtn.disabled = true;
    submitBtn.textContent = "Ya has calificado";
    submitBtn.style.opacity = "0.6";
    submitBtn.style.cursor = "not-allowed";
  }
}

function addReviewToList(review) {
  const list = document.getElementById("reviews-list");
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
  newReviewElement.style.animation = 'fadeIn 0.5s ease-in';
}

function showSuccessMessage() {
  // Crear mensaje temporal de éxito
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
  // Esperar un momento para que se carguen los comentarios
  setTimeout(() => {
    const currentUser = getCurrentUser();
    if (!currentUser) return;
    
    const username = cleanUsername(currentUser.username);
    
    if (hasUserAlreadyReviewed(username)) {
      disableReviewForm("Ya has calificado este producto");
    }
  }, 1000); // Esperar 1 segundo para que se carguen los comentarios de la API
}

// === INICIALIZACIÓN ===

document.addEventListener("DOMContentLoaded", function () {
  // Session control is handled globally by init.js
  // updateUserInterface() and setupLogout() are now in init.js
  loadProductInfo();

  setupQuantityControls();
  
  // DESAFÍO: Configurar formulario de calificación
  setupReviewForm();
  
  // Verificar si el usuario ya comentó este producto
  checkIfUserAlreadyReviewed();
});
