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
  } else {
    showError("No se pudo cargar la información del producto");
  }
}

// === INICIALIZACIÓN ===

document.addEventListener("DOMContentLoaded", function () {
  // Session control is handled globally by init.js
  updateUserInterface();
  setupLogout();
  loadProductInfo();
});
