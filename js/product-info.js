// === GESTIÓN DE INTERFAZ DE USUARIO ===

function updateUserInterface() {
  const usernameDisplay = document.getElementById("usernameDisplay");

  const user = getCurrentUser();
  if (usernameDisplay && user) {
    usernameDisplay.textContent = user.username;
  }
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
    if (reviewThumb && Array.isArray(product.images) && product.images[0]) {
      reviewThumb.src = product.images[0];
      reviewThumb.alt = `Imagen de ${product.name}`;
    }
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

// === INICIALIZACIÓN ===

document.addEventListener("DOMContentLoaded", function () {
  // Session control is handled globally by init.js
  updateUserInterface();
  setupLogout();
  loadProductInfo();

  setupQuantityControls();
});
