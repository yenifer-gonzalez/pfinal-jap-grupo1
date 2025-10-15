// === FUNCIONALIDAD ESPECÍFICA DE MY-PROFILE ===
// Las funciones updateUserInterface() y setupLogout() están centralizadas en init.js

// === FUNCIONALIDAD DE PERFIL DE USUARIO ===

// === INICIALIZACIÓN ===

document.addEventListener("DOMContentLoaded", function () {
  // Session control is handled globally by init.js
  // updateUserInterface() and setupLogout() are now in init.js
  
  // Cargar datos del perfil específicos de esta página
  loadUserProfile();
});