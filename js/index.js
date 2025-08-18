// === GESTIÓN DE INTERFAZ DE USUARIO ===

function updateUserInterface() {
    const userSection = document.getElementById('userSection');
    const loginSection = document.getElementById('loginSection');
    const usernameDisplay = document.getElementById('usernameDisplay');
    
    if (isUserLoggedIn()) {
        const user = getCurrentUser();
        if (user) {
            // Mostrar sección de usuario logueado
            userSection.style.display = 'block';
            loginSection.style.display = 'none';
            usernameDisplay.textContent = user.username;
        }
    } else {
        // Mostrar sección de login
        userSection.style.display = 'none';
        loginSection.style.display = 'block';
    }
}

function setupLogout() {
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            if (confirm('¿Estás seguro de que deseas cerrar sesión?')) {
                logout();
            }
        });
    }
}

document.addEventListener("DOMContentLoaded", function(){
    document.getElementById("autos").addEventListener("click", function() {
        localStorage.setItem("catID", 101);
        window.location = "products.html"
    });
    document.getElementById("juguetes").addEventListener("click", function() {
        localStorage.setItem("catID", 102);
        window.location = "products.html"
    });
    document.getElementById("muebles").addEventListener("click", function() {
        localStorage.setItem("catID", 103);
        window.location = "products.html"
    });

    updateUserInterface();
    setupLogout();
});