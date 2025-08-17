// === GESTIÓN DE SESIÓN ===

// Función para verificar si hay una sesión activa
function checkActiveSession() {
    const user = localStorage.getItem('currentUser');
    const sessionExpiry = localStorage.getItem('sessionExpiry');
    
    if (user && sessionExpiry) {
        const now = new Date().getTime();
        if (now < parseInt(sessionExpiry)) {
            // Sesión válida, redireccionar a index
            window.location.href = 'index.html';
            return true;
        } else {
            // Sesión expirada, limpiar datos
            clearSession();
        }
    }
    return false;
}

// Función para crear una nueva sesión
function createSession(username) {
    const sessionData = {
        username: username,
        loginTime: new Date().getTime()
    };
    
    // Sesión expira en 24 horas
    const expiryTime = new Date().getTime() + (24 * 60 * 60 * 1000);
    
    localStorage.setItem('currentUser', JSON.stringify(sessionData));
    localStorage.setItem('sessionExpiry', expiryTime.toString());
}

// Función para limpiar la sesión
function clearSession() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('sessionExpiry');
}

// === VALIDACIÓN DE FORMULARIO ===

// === FUNCIONALIDADES DE LA INTERFAZ ===
// Función para alternar visibilidad de contraseña
// Función para manejar el envío del formulario

// === INICIALIZACIÓN ===