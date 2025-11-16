const CATEGORIES_URL = 'https://japceibal.github.io/emercado-api/cats/cat.json';
const PUBLISH_PRODUCT_URL = 'https://japceibal.github.io/emercado-api/sell/publish.json';
const PRODUCTS_URL = 'https://japceibal.github.io/emercado-api/cats_products/';
const PRODUCT_INFO_URL = 'https://japceibal.github.io/emercado-api/products/';
const PRODUCT_INFO_COMMENTS_URL = 'https://japceibal.github.io/emercado-api/products_comments/';
const CART_INFO_URL = 'https://japceibal.github.io/emercado-api/user_cart/';
const CART_BUY_URL = 'https://japceibal.github.io/emercado-api/cart/buy.json';
const EXT_TYPE = '.json';
const PUBLIC_PAGES = ['login.html'];

// SPINNER GLOBAL (LOADER VISUAL)
// Muestra el overlay del spinner centrado en pantalla
let showSpinner = function () {
  document.getElementById('spinner-wrapper').classList.add('active');
};
// Oculta el overlay del spinner
let hideSpinner = function () {
  document.getElementById('spinner-wrapper').classList.remove('active');
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
      result.status = 'ok';
      result.data = response;
      hideSpinner();
      return result;
    })
    .catch(function (error) {
      result.status = 'error';
      result.data = error;
      hideSpinner();
      return result;
    });
};

// === HELPERS GENERALES / UTILITARIOS ===

// Lee un valor desde localStorage y lo parsea como JSON de forma segura
function readLS(key, fallback = null) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}

// Escribe un valor en localStorage en formato JSON
function writeLS(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

// Formatea un monto en forma amigable, mostrando decimales solo si son necesarios
function money(amount, currency = 'USD') {
  const raw = Number(amount) || 0;
  const value = Math.round((raw + Number.EPSILON) * 100) / 100;

  const hasDecimals = Math.abs(value - Math.round(value)) > 1e-6;
  const fractionDigits = hasDecimals ? 2 : 0;

  return `${currency} ${value.toLocaleString('en-US', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  })}`;
}

function isMobile() {
  return window.matchMedia('(max-width: 767px)').matches;
}

// === GESTIÓN DE SESIÓN / AUTENTICACIÓN ===

// Verifica si hay una sesión activa válida en localStorage
function isUserLoggedIn() {
  const user = localStorage.getItem('currentUser');
  const sessionExpiry = localStorage.getItem('sessionExpiry');

  if (!user || !sessionExpiry) {
    return false;
  }

  const now = Date.now();
  if (now >= parseInt(sessionExpiry)) {
    // Sesión expirada, limpiar datos
    localStorage.removeItem('currentUser');
    localStorage.removeItem('sessionExpiry');
    return false;
  }
  return true;
}

// Devuelve el objeto usuario actual si la sesión es válida
function getCurrentUser() {
  if (!isUserLoggedIn()) return null;

  const userData = localStorage.getItem('currentUser');
  try {
    return JSON.parse(userData);
  } catch (e) {
    console.error('Error parsing user data:', e);
    localStorage.removeItem('currentUser');
    return null;
  }
}

// Cierra la sesión actual y redirige a login
function logout() {
  localStorage.removeItem('currentUser');
  localStorage.removeItem('sessionExpiry');
  window.location.href = 'login.html';
}

// Fuerza autenticación en páginas protegidas
function requireAuthentication() {
  if (!isUserLoggedIn()) {
    window.location.href = 'login.html';
    return false;
  }
  return true;
}

// === UI GLOBAL: CARRITO + NOMBRE USUARIO ===

// Actualiza el badge del carrito (desktop y mobile) con la cantidad total de ítems
function updateCartBadge() {
  try {
    const cartData = localStorage.getItem('cart');
    const cart = cartData ? JSON.parse(cartData) : [];
    const totalItems = cart.reduce((acc, it) => acc + (it.count ?? 1), 0);

    // Actualizar todos los badges en la página (desktop y mobile)
    const badges = document.querySelectorAll('#cartBadge, #cartBadgeMobile');
    badges.forEach((badge) => {
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

// Actualiza la interfaz con datos del usuario (nombre, etc.)
function updateUserInterface() {
  const usernameDisplay = document.getElementById('usernameDisplay');
  const sidebarUsername = document.getElementById('sidebarUsername');
  const user = getCurrentUser();

  if (usernameDisplay) {
    usernameDisplay.textContent = user?.username || '';
  }
  if (sidebarUsername) {
    sidebarUsername.textContent = user?.username || '';
  }

  // Actualizar el badge del carrito
  updateCartBadge();
}

// Vincula todos los botones/enlaces de logout presentes en el DOM
function setupLogout() {
  const logoutButtons = document.querySelectorAll('[data-logout], #logoutBtn');

  logoutButtons.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      logout();
    });
  });
}

// === CONFIGURACIÓN DE NAVEGACIÓN DE PRODUCTOS ===
function setupProductsNavigation() {
  const links = document.querySelectorAll('a[href="products.html"]');

  links.forEach((link) => {
    // Ignorar los links de categorías (tienen onclick)
    if (link.getAttribute('onclick')) return;

    link.addEventListener('click', () => {
      localStorage.setItem('showAllProducts', 'true');
      localStorage.removeItem('catID');
    });
  });
}

// HEME TOGGLE (LIGHT / DARK)

// Configura los botones que alternan entre modo claro / oscuro
function setupThemeToggle() {
  const themeToggle = document.getElementById('theme-toggle');
  const themeToggleSidebar = document.getElementById('theme-toggle-sidebar');

  const toggleTheme = () => {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
    updateThemeIcon(newTheme);
  };

  // Botón flotante (desktop)
  if (themeToggle) {
    themeToggle.addEventListener('click', toggleTheme);
  }

  // Botón del sidebar (mobile)
  if (themeToggleSidebar) {
    themeToggleSidebar.addEventListener('click', toggleTheme);
  }
}

// Aplica el tema guardado en localStorage al iniciar
function applySavedTheme() {
  const savedTheme = localStorage.getItem('theme') || 'light';
  document.documentElement.setAttribute('data-theme', savedTheme);
  updateThemeIcon(savedTheme);
}

// Actualiza los íconos del toggle de tema (sol / luna)
function updateThemeIcon(theme) {
  const themeToggle = document.getElementById('theme-toggle');
  const themeToggleSidebar = document.getElementById('theme-toggle-sidebar');

  // Actualizar botón flotante
  if (themeToggle) {
    const icon = themeToggle.querySelector('i');
    if (icon) {
      icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
  }

  // Actualizar botón del sidebar
  if (themeToggleSidebar) {
    const icon = themeToggleSidebar.querySelector('i');
    const span = themeToggleSidebar.querySelector('span');

    if (icon) {
      icon.className = theme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
    }
    if (span) {
      span.textContent = theme === 'dark' ? 'Modo claro' : 'Modo oscuro';
    }
  }
}

// === BOTÓN "VOLVER ARRIBA" ===
function setupBackToTop() {
  const backToTopBtn = document.getElementById('goTop');
  if (!backToTopBtn) return;

  backToTopBtn.addEventListener('click', (e) => {
    e.preventDefault();
    document.body.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth',
    });
  });
}

// === REGISTRO DE SERVICE WORKER ===

// Registra el Service Worker (sw.js) para soporte offline y mejora de performance
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('./sw.js')
      .then((registration) => {
        console.log('[SW] Service Worker registrado exitosamente:', registration.scope);

        // Verificar actualizaciones periódicamente
        setInterval(() => {
          registration.update();
        }, 60000); // Verificar cada minuto
      })
      .catch((error) => {
        console.error('[SW] Error al registrar Service Worker:', error);
      });
  });
}

// === INICIALIZACIÓN GLOBAL ===
document.addEventListener('DOMContentLoaded', () => {
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';

  // Control de autenticación para páginas protegidas
  if (!PUBLIC_PAGES.includes(currentPage)) {
    if (!requireAuthentication()) {
      // Si no hay sesión válida, requireAuthentication ya redirigió
      return;
    }
  }

  // Si ya hay sesión y estoy en login, mando a index
  if (currentPage === 'login.html' && isUserLoggedIn()) {
    window.location.href = 'index.html';
    return;
  }

  // === UI GLOBAL: NAV y FILTROS ===
  const navSidebar = document.getElementById('navSidebar');
  const filtersSidebar = document.getElementById('filtersSidebar');
  const overlay = document.getElementById('overlay');

  // Menú hamburguesa
  const menuBtn = document.getElementById('menuButton');
  if (menuBtn && navSidebar && overlay) {
    menuBtn.addEventListener('click', () => {
      navSidebar.classList.add('show');
      navSidebar.classList.remove('hidden');
      overlay.classList.remove('hidden');
    });
  }

  // Abrir filtros desde el label
  const filtersLabel = document.querySelector('.filters-label');
  if (filtersLabel && filtersSidebar && overlay) {
    filtersLabel.addEventListener('click', () => {
      if (!isMobile()) return; // Evitar que se abra en desktop
      filtersSidebar.classList.add('show');
      filtersSidebar.classList.remove('hidden');
      overlay.classList.remove('hidden');
    });
  }

  // Cerrar al tocar overlay
  if (overlay) {
    overlay.addEventListener('click', () => {
      if (navSidebar) {
        navSidebar.classList.remove('show');
        navSidebar.classList.add('hidden');
      }
      if (filtersSidebar) {
        filtersSidebar.classList.remove('show');
        filtersSidebar.classList.add('hidden');
      }
      overlay.classList.add('hidden');
    });
  }

  //  Cerrar filtros si vuelvo a escritorio desde mobile
  window.addEventListener('resize', () => {
    if (!isMobile() && filtersSidebar?.classList.contains('show')) {
      filtersSidebar.classList.remove('show');
      filtersSidebar.classList.add('hidden');
      overlay?.classList.add('hidden');
    }
  });

  // UI de usuario + logout (solo en páginas autenticadas)
  if (!PUBLIC_PAGES.includes(currentPage)) {
    updateUserInterface();
    setupLogout();
  }

  // Navegación de productos (enlace "Productos" = mostrar todos)
  setupProductsNavigation();

  // Aplicar tema guardado + configurar toggles de tema
  applySavedTheme();
  setupThemeToggle();

  // Botón "Volver arriba" del footer
  setupBackToTop();
});
