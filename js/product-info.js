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

// === INICIALIZACIÓN ===

document.addEventListener("DOMContentLoaded", function () {
  // Session control is handled globally by init.js
  updateUserInterface();
  setupLogout();
});