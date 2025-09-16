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

async function loadProductInfo() {
  const productId = localStorage.getItem("selectedProduct");
  const url = `https://japceibal.github.io/emercado-api/products/${productId}.json`;
  const resultObj = await getJSONData(url);
  
  if (resultObj.status === "ok") {
    // Insertar datos en el HTML
    const product = resultObj.data;
    document.getElementById("pi-title").textContent = product.name;
    document.getElementById("pi-price").textContent = `${product.currency} ${product.cost}`;
    document.getElementById("pi-description").textContent = product.description;
    document.getElementById("pi-category").textContent = product.category.name;
    document.getElementById("pi-sold").textContent = product.soldCount;
    document.getElementById("pi-main-image").src = product.images[0]
    Document.getElementById("pi-")
    
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