const CATEGORIES_URL = "https://japceibal.github.io/emercado-api/cats/cat.json";
const PUBLISH_PRODUCT_URL = "https://japceibal.github.io/emercado-api/sell/publish.json";
const PRODUCTS_URL = "https://japceibal.github.io/emercado-api/cats_products/";
const PRODUCT_INFO_URL = "https://japceibal.github.io/emercado-api/products/";
const PRODUCT_INFO_COMMENTS_URL = "https://japceibal.github.io/emercado-api/products_comments/";
const CART_INFO_URL = "https://japceibal.github.io/emercado-api/user_cart/";
const CART_BUY_URL = "https://japceibal.github.io/emercado-api/cart/buy.json";
const EXT_TYPE = ".json";

let showSpinner = function(){
  document.getElementById("spinner-wrapper").style.display = "block";
}

let hideSpinner = function(){
  document.getElementById("spinner-wrapper").style.display = "none";
}

let getJSONData = function(url){
    let result = {};
    showSpinner();
    return fetch(url)
    .then(response => {
      if (response.ok) {
        return response.json();
      }else{
        throw Error(response.statusText);
      }
    })
    .then(function(response) {
          result.status = 'ok';
          result.data = response;
          hideSpinner();
          return result;
    })
    .catch(function(error) {
        result.status = 'error';
        result.data = error;
        hideSpinner();
        return result;
    });
}

// === GESTIÓN GLOBAL DE SESIÓN ===

// Función para verificar si hay una sesión activa
function isUserLoggedIn() {
    const user = localStorage.getItem('currentUser');
    const sessionExpiry = localStorage.getItem('sessionExpiry');
    
    if (!user || !sessionExpiry) {
        return false;
    }
    
    const now = new Date().getTime();
    if (now >= parseInt(sessionExpiry)) {
        // Sesión expirada, limpiar datos
        localStorage.removeItem('currentUser');
        localStorage.removeItem('sessionExpiry');
        return false;
    }
    
    return true;
}

// Función para obtener datos del usuario actual
function getCurrentUser() {
    if (isUserLoggedIn()) {
        const userData = localStorage.getItem('currentUser');
        try {
            return JSON.parse(userData);
        } catch (e) {
            console.error('Error parsing user data:', e);
            localStorage.removeItem('currentUser');
            return null;
        }
    }
    return null;
}

// Función para cerrar sesión
function logout() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('sessionExpiry');
    window.location.href = 'login.html';
}

// Función para verificar autenticación en páginas protegidas
function requireAuthentication() {
    const currentPage = window.location.pathname.split('/').pop();
    const publicPages = ['login.html', 'index.html', ''];
    
    // Si la página actual no es pública y no hay sesión, redireccionar
    if (!publicPages.includes(currentPage) && !isUserLoggedIn()) {
        window.location.href = 'login.html';
        return false;
    }
    
    return true;
}

// === INICIALIZACIÓN GLOBAL ===

document.addEventListener('DOMContentLoaded', function() {
    // Verificar autenticación al cargar cualquier página
    const currentPage = window.location.pathname.split('/').pop();
    
    // Solo aplicar verificación de autenticación en páginas específicas
    const protectedPages = ['products.html', 'product-info.html', 'cart.html', 'categories.html', 'sell.html', 'my-profile.html'];
    
    if (protectedPages.includes(currentPage)) {
        if (!requireAuthentication()) {
            return;
        }
    }
    
    // Si el usuario está en login.html pero ya tiene sesión, redireccionar a index
    if (currentPage === 'login.html' && isUserLoggedIn()) {
        window.location.href = 'index.html';
        return;
    }
    
});