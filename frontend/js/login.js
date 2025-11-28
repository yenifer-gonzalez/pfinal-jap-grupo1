// === GESTIÓN DE SESIÓN ===

// Función para verificar si hay una sesión activa
function checkActiveSession() {
  const user = localStorage.getItem('currentUser');
  const sessionExpiry = localStorage.getItem('sessionExpiry');

  if (!user || !sessionExpiry) return false;

  const now = Date.now();

  if (now < Number(sessionExpiry)) {
    // Sesión válida, redireccionar a index
    window.location.href = 'index.html';
  } else {
    // Sesión expirada, limpiar datos
    clearSession();
  }
  return false;
}

// Crea una nueva sesión válida por 24 horas
function createSession(username) {
  const sessionData = {
    username,
    loginTime: Date.now(),
  };

  // Sesión expira en 24 horas
  const expiryTime = Date.now() + 24 * 60 * 60 * 1000;

  localStorage.setItem('currentUser', JSON.stringify(sessionData));
  localStorage.setItem('sessionExpiry', expiryTime.toString());
}

//  Limpia la sesión del localStorage
function clearSession() {
  localStorage.removeItem('currentUser');
  localStorage.removeItem('sessionExpiry');
}

// === VALIDACIÓN DE FORMULARIO ===

// Aplica una animación de error y muestra mensaje
function showFieldError(input, errorContainer, message) {
  errorContainer.innerText = message;
  input.classList.add('error');

  setTimeout(() => input.classList.remove('error'), 400);
}

// Valida el formulario de login
function handleSubmit(event) {
  event.preventDefault();

  const user = document.getElementById('username');
  const pass = document.getElementById('password');
  const errorUser = document.getElementById('error-user');
  const errorPass = document.getElementById('error-pass');
  const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // --- Validación de email ---
  if (!user.value.trim()) {
    return showFieldError(user, errorUser, 'Por favor, ingrese un email.');
  }

  if (!regexEmail.test(user.value)) {
    return showFieldError(user, errorUser, 'Por favor, ingrese un email válido.');
  }

  errorUser.innerText = '';

  // Validación de contraseña
  const passValue = pass.value;

  if (!pass.value) {
    return showFieldError(pass, errorPass, 'Por favor, ingrese una contraseña.');
  }

  // Validar longitud mínima
  if (pass.value.length < 6) {
    return showFieldError(pass, errorPass, 'Debe tener al menos 6 caracteres.');
  }

  // Validar que contenga al menos una letra
  if (!/[a-zA-Z]/.test(passValue)) {
    return showFieldError(pass, errorPass, 'Debe contener al menos una letra.');
  }

  // Validar que contenga al menos un número
  if (!/[0-9]/.test(passValue)) {
    return showFieldError(pass, errorPass, 'Debe contener al menos un número.');
  }

  // Contraseña válida
  errorPass.innerText = '';

  // Recordarme
  const remember = document.getElementById('remember');

  if (remember.checked) {
    localStorage.setItem('rememberMe', user.value);
  } else {
    localStorage.removeItem('rememberMe');
  }

  // NUEVO: Llamar al backend
  fetch('http://localhost:3000/api/auth/login', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      username: user.value,
      password: pass.value
    })
  })
  .then(response => response.json())
  .then(data => {
    if (data.success) {
      // Guardar token en localStorage
      localStorage.setItem('authToken', data.data.token);

      // Crear sesión como antes
      createSession(user.value);

      // Redirigir
      window.location.href = 'index.html';
    } else {
      showFieldError(pass, errorPass, data.message || 'Error al iniciar sesión');
    }
  })
  .catch(error => {
    console.error('Error:', error);
    showFieldError(pass, errorPass, 'Error de conexión con el servidor');
  });
}

// === FUNCIONALIDADES DE LA INTERFAZ ===

// Alterna visibilidad de la contraseña
function changeEye() {
  const pass = document.getElementById('password');
  const icon = document.getElementById('eyeIcon');
  const showing = pass.type === 'text';

  pass.type = showing ? 'password' : 'text';
  icon.classList.toggle('fa-eye', showing);
  icon.classList.toggle('fa-eye-slash', !showing);
}

// === INICIALIZACIÓN ===
document.addEventListener('DOMContentLoaded', () => {
  checkActiveSession();

  // Autocompletar email si “Recordarme” está activo
  const savedEmail = localStorage.getItem('rememberMe');
  if (savedEmail) {
    document.getElementById('username').value = savedEmail;
  }
});
