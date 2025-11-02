const CATEGORIES_URL = "https://japceibal.github.io/emercado-api/cats/cat.json";
const PUBLISH_PRODUCT_URL =
  "https://japceibal.github.io/emercado-api/sell/publish.json";
const PRODUCTS_URL = "https://japceibal.github.io/emercado-api/cats_products/";
const PRODUCT_INFO_URL = "https://japceibal.github.io/emercado-api/products/";
const PRODUCT_INFO_COMMENTS_URL =
  "https://japceibal.github.io/emercado-api/products_comments/";
const CART_INFO_URL = "https://japceibal.github.io/emercado-api/user_cart/";
const CART_BUY_URL = "https://japceibal.github.io/emercado-api/cart/buy.json";
const EXT_TYPE = ".json";

let showSpinner = function () {
  document.getElementById("spinner-wrapper").style.display = "block";
};

let hideSpinner = function () {
  document.getElementById("spinner-wrapper").style.display = "none";
};

let getJSONData = function (url) {
  let result = {};
  showSpinner();
  return fetch(url)
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        throw Error(response.statusText);
      }
    })
    .then(function (response) {
      result.status = "ok";
      result.data = response;
      hideSpinner();
      return result;
    })
    .catch(function (error) {
      result.status = "error";
      result.data = error;
      hideSpinner();
      return result;
    });
};

// === GESTIÓN GLOBAL DE SESIÓN ===

// Función para verificar si hay una sesión activa
function isUserLoggedIn() {
  const user = localStorage.getItem("currentUser");
  const sessionExpiry = localStorage.getItem("sessionExpiry");

  if (!user || !sessionExpiry) {
    return false;
  }

  const now = new Date().getTime();
  if (now >= parseInt(sessionExpiry)) {
    // Sesión expirada, limpiar datos
    localStorage.removeItem("currentUser");
    localStorage.removeItem("sessionExpiry");
    return false;
  }

  return true;
}

// Función para obtener datos del usuario actual
function getCurrentUser() {
  if (isUserLoggedIn()) {
    const userData = localStorage.getItem("currentUser");
    try {
      return JSON.parse(userData);
    } catch (e) {
      console.error("Error parsing user data:", e);
      localStorage.removeItem("currentUser");
      return null;
    }
  }
  return null;
}

// Función para cerrar sesión
function logout() {
  localStorage.removeItem("currentUser");
  localStorage.removeItem("sessionExpiry");
  window.location.href = "login.html";
}

// Función para verificar autenticación en páginas protegidas
function requireAuthentication() {
  if (!isUserLoggedIn()) {
    window.location.href = "login.html";
    return false;
  }
  return true;
}

// === GESTIÓN GLOBAL DE INTERFAZ DE USUARIO ===

// === FUNCIONES GLOBALES DE CARRITO ===

// Función para actualizar el badge del carrito en todas las páginas
function updateCartBadge() {
  try {
    const cartData = localStorage.getItem('cart');
    const cart = cartData ? JSON.parse(cartData) : [];
    const totalItems = cart.reduce((acc, it) => acc + (it.count ?? 1), 0);
    
    // Actualizar todos los badges en la página
    const badges = document.querySelectorAll('#cartBadge');
    badges.forEach(badge => {
      if (totalItems > 0) {
        badge.textContent = totalItems;
        badge.style.display = 'inline-block';
      } else {
        badge.style.display = 'none';
      }
    });
  } catch (error) {
    console.error('Error updating cart badge:', error);
  }
}

// === FUNCIONES GLOBALES DE INTERFAZ DE USUARIO ===

// Función para actualizar la interfaz con el nombre del usuario
function updateUserInterface() {
  const usernameDisplay = document.getElementById("usernameDisplay");
  const sidebarUsername = document.getElementById("sidebarUsername");
  const user = getCurrentUser();

  if (usernameDisplay) {
    usernameDisplay.textContent = user?.username || "";
  }
  if (sidebarUsername) {
    sidebarUsername.textContent = user?.username || "";
  }
  
  // Actualizar el badge del carrito
  updateCartBadge();
}

// Función para configurar los botones de logout
function setupLogout() {
  const logoutButtons = document.querySelectorAll("[data-logout], #logoutBtn");
  
  logoutButtons.forEach((btn) => {
    btn.addEventListener("click", (e) => {
      e.preventDefault();
      logout();
    });
  });
}

// ==== HELPER GLOBAL ====
// Función para detectar si estamos en mobile (pantallas <= 767px)
function isMobile() {
  return window.matchMedia("(max-width: 767px)").matches;
}

// === INICIALIZACIÓN GLOBAL ===
document.addEventListener("DOMContentLoaded", function () {
  // Verificar autenticación al cargar cualquier página
  const currentPage = window.location.pathname.split("/").pop();

  // Páginas que no requieren autenticación
  const publicPages = ["login.html"];

  // Aplicar verificación de autenticación solo si NO es una página pública
  if (!publicPages.includes(currentPage)) {
    if (!requireAuthentication()) {
      return; // Detener ejecución si no hay sesión válida
    }
  }

  // Si el usuario está en login.html pero ya tiene sesión, redireccionar a index
  if (currentPage === "login.html" && isUserLoggedIn()) {
    window.location.href = "index.html";
    return;
  }

  // === UI GLOBAL: NAV y FILTROS ===
  const navSidebar = document.getElementById("navSidebar");
  const filtersSidebar = document.getElementById("filtersSidebar");
  const overlay = document.getElementById("overlay");

  // Botón hamburguesa
  const menuBtn = document.getElementById("menuButton");
  if (menuBtn && navSidebar && overlay) {
    menuBtn.addEventListener("click", () => {
      navSidebar.classList.add("show");
      navSidebar.classList.remove("hidden");
      overlay.classList.remove("hidden");
    });
  }

  // Abrir filtros desde el label
  const filtersLabel = document.querySelector(".filters-label");
  if (filtersLabel && filtersSidebar && overlay) {
    filtersLabel.addEventListener("click", () => {
      if (!isMobile()) return; // Evitar que se abra en desktop
      filtersSidebar.classList.add("show");
      filtersSidebar.classList.remove("hidden");
      overlay.classList.remove("hidden");
    });
  }

  // Cerrar al tocar overlay
  if (overlay) {
    overlay.addEventListener("click", () => {
      if (navSidebar) {
        navSidebar.classList.remove("show");
        navSidebar.classList.add("hidden");
      }
      if (filtersSidebar) {
        filtersSidebar.classList.remove("show");
        filtersSidebar.classList.add("hidden");
      }
      overlay.classList.add("hidden");
    });
  }

  // REACCIONAR AL RESIZE (cerrar filtros si vuelvo a desktop)
  window.addEventListener("resize", () => {
    // Si dejo de estar en mobile y el sidebar de filtros está abierto, se cierra
    if (!isMobile() && filtersSidebar?.classList.contains("show")) {
      filtersSidebar.classList.remove("show");
      filtersSidebar.classList.add("hidden");
      overlay?.classList.add("hidden");
    }
  });

  // === INICIALIZACIÓN DE INTERFAZ Y LOGOUT ===
  // Ejecutar en todas las páginas autenticadas
  if (!publicPages.includes(currentPage)) {
    updateUserInterface();
    setupLogout();
  }

  // === THEME TOGGLE INITIALIZATION ===
  // Aplicar tema guardado y configurar el toggle
  applySavedTheme();
  setupThemeToggle();
});

// === GESTIÓN DEL THEME TOGGLE ===

// Función para configurar el botón de cambio de tema
function setupThemeToggle() {
  const themeToggle = document.getElementById('theme-toggle');
  if (!themeToggle) return;
  
  themeToggle.addEventListener('click', () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
  });
}

// Función para aplicar el tema guardado al cargar la página
function applySavedTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);
}

// Función para actualizar el icono según el tema activo
function updateThemeIcon(theme) {
  const themeToggle = document.getElementById('theme-toggle');
  if (!themeToggle) return;
  
  const icon = themeToggle.querySelector('i');
  
  if (theme === 'dark') {
    icon.className = 'fas fa-sun';  // Mostrar sol en modo oscuro
  } else {
    icon.className = 'fas fa-moon'; // Mostrar luna en modo claro
  }
}
