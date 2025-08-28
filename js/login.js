// === GESTIÓN DE SESIÓN ===

// Función para verificar si hay una sesión activa
function checkActiveSession() {
  const user = localStorage.getItem("currentUser");
  const sessionExpiry = localStorage.getItem("sessionExpiry");

  if (user && sessionExpiry) {
    const now = new Date().getTime();
    if (now < parseInt(sessionExpiry)) {
      // Sesión válida, redireccionar a index
      window.location.href = "index.html";
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
    loginTime: new Date().getTime(),
  };

  // Sesión expira en 24 horas
  const expiryTime = new Date().getTime() + 24 * 60 * 60 * 1000;

  localStorage.setItem("currentUser", JSON.stringify(sessionData));
  localStorage.setItem("sessionExpiry", expiryTime.toString());
}

// Función para limpiar la sesión
function clearSession() {
  localStorage.removeItem("currentUser");
  localStorage.removeItem("sessionExpiry");
}

// === VALIDACIÓN DE FORMULARIO ===

function handleSubmit(event) {
  event.preventDefault();

  const user = document.getElementById("username");
  const pass = document.getElementById("password");
  const errorUser = document.getElementById("error-user");
  const errorPass = document.getElementById("error-pass");
  const regexEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!user.value) {
    errorUser.innerText = "Por favor, ingrese un email.";
    return;
  } else if (!regexEmail.test(user.value)) {
    errorUser.innerText = "Por favor, ingrese un email válido.";
    return;
  } else {
    errorUser.innerText = "";
  }

  if (!pass.value) {
    errorPass.innerText = "Por favor, ingrese una contraseña.";
    return;
  } else {
    errorPass.innerText = "";
  }

  let remember = document.getElementById("remember");

  if (remember.checked) {
    localStorage.setItem("rememberMe", user.value);
  } else {
    localStorage.removeItem("rememberMe");
  }

  createSession(user.value);
  checkActiveSession();
}

// === FUNCIONALIDADES DE LA INTERFAZ ===
// Función para alternar visibilidad de contraseña

function changeEye() {
  const pass = document.getElementById("password");
  const icon = document.getElementById("eyeIcon");
  const showing = pass.type === "text";

  pass.type = showing ? "password" : "text";
  icon.classList.toggle("bi-eye", showing);
  icon.classList.toggle("bi-eye-slash", !showing);
}

// === INICIALIZACIÓN ===

document.addEventListener("DOMContentLoaded", () => {
  checkActiveSession();

  let user = document.getElementById("username");
  let email = localStorage.getItem("rememberMe");

  if (email) {
    user.value = email;
  }
});
