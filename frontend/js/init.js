const API_BASE_URL = 'http://localhost:3000/api';
const CATEGORIES_URL = `${API_BASE_URL}/categories`;
const PUBLISH_PRODUCT_URL = `${API_BASE_URL}/sell/publish`;
const PRODUCTS_URL = `${API_BASE_URL}/products/`;
const PRODUCT_INFO_URL = `${API_BASE_URL}/products/detail/`;
const PRODUCT_INFO_COMMENTS_URL = `${API_BASE_URL}/products/comments/`;
const CART_INFO_URL = `${API_BASE_URL}/user_cart/`;
const CART_BUY_URL = `${API_BASE_URL}/cart`;
const EXT_TYPE = '.json';
const PUBLIC_PAGES = ['login.html', 'index.html'];


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

  // Obtener token del localStorage
  const token = localStorage.getItem('authToken');
  
  const headers = {
    'Content-Type': 'application/json'
  };
  
  // Si hay token, agregarlo al header
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  return fetch(url, {headers})
    .then((response) => {
      if (response.ok) {
        return response.json();
      } else {
        throw Error(response.statusText);
      }
    })
    .then(function (response) {
      // El backend devuelve { success, data }
      result.status = 'ok';
      result.data = response.data || response;
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
// Si withSymbol es true, muestra el símbolo de la moneda (ej: "USD $1,234.56")
// Si withSymbol es false, muestra solo el código (ej: "USD 1234.56")
function money(amount, currency = 'USD', withSymbol = false) {
  const raw = Number(amount) || 0;
  const value = Math.round((raw + Number.EPSILON) * 100) / 100;

  if (withSymbol) {
    // Formato con símbolo de moneda
    return new Intl.NumberFormat('es-UY', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
    }).format(value);
  }

  // Formato simple sin símbolo (comportamiento original)
  const hasDecimals = Math.abs(value - Math.round(value)) > 1e-6;
  const fractionDigits = hasDecimals ? 2 : 0;

  return `${currency} ${value.toLocaleString('en-US', {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  })}`;
}

// Formatea una fecha ISO o timestamp a formato legible en español
// Soporta múltiples formatos de entrada:
// - ISO string: "2024-01-15T10:30:00"
// - Date string: "2024-01-15 10:30:00"
// - Simple date: "2024-01-15"
// shortFormat = true: "15/01/2024" (solo fecha)
// shortFormat = false: "15 de enero de 2024, 10:30" (fecha y hora)
function formatDate(dateInput, shortFormat = false) {
  if (!dateInput) return '';

  let date;

  // Si es string tipo "2024-01-15" o "2024-01-15 10:30:00"
  if (typeof dateInput === 'string') {
    // Formato corto dd/mm/yyyy para fechas de reviews
    if (shortFormat && dateInput.includes('-')) {
      try {
        const [datePart] = dateInput.split(' ');
        const [yyyy, mm, dd] = datePart.split('-');
        if (yyyy && mm && dd) {
          return `${dd}/${mm}/${yyyy}`;
        }
      } catch (e) {
        // Si falla, continuar con formato normal
      }
    }

    date = new Date(dateInput);
  } else {
    date = new Date(dateInput);
  }

  // Verificar que la fecha es válida
  if (isNaN(date.getTime())) {
    return String(dateInput);
  }

  // Formato largo con fecha y hora
  return date.toLocaleDateString('es-UY', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
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
