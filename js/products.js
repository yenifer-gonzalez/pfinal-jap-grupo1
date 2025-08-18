// === GESTIÓN DE SESIÓN ===

// Función para verificar sesión activa
function checkUserSession() {
    const user = localStorage.getItem('currentUser');
    const sessionExpiry = localStorage.getItem('sessionExpiry');
    
    if (!user || !sessionExpiry) {
        redirectToLogin();
        return false;
    }
    
    const now = new Date().getTime();
    if (now >= parseInt(sessionExpiry)) {
        // Sesión expirada
        clearSession();
        redirectToLogin();
        return false;
    }
    
    return true;
}

// Función para limpiar sesión
function clearSession() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('sessionExpiry');
}

// Función para redireccionar al login
function redirectToLogin() {
    window.location.href = 'login.html';
}