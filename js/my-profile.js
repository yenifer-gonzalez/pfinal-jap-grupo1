// === FUNCIONALIDAD ESPECÍFICA DE MY-PROFILE ===
const PROFILE_KEY = "profileData";
const PLACEHOLDER_IMG = "img/img_perfil.png";

// ===== Utils =====
const readLS = (key, fb = null) => {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fb;
  } catch {
    return fb;
  }
};
const writeLS = (key, value) =>
  localStorage.setItem(key, JSON.stringify(value));

// Obtiene el email inicial desde la sesión solo si es válido.
function getInitialEmail() {
  try {
    const user = getCurrentUser();
    const email = user?.username || "";
    return email.includes("@") ? email : "";
  } catch {
    return "";
  }
}

// Completa el nombre en la tarjeta lateral (sidebar).
function fillSidebarName(data) {
  const el = document.getElementById("profileSidebarName");
  if (!el) return;
  const full = [data.firstName, data.lastName].filter(Boolean).join(" ").trim();
  el.textContent = full || "Nombre Apellido";
}

// ===== Carga/guardado de perfil =====
function loadUserProfile() {
  const stored = readLS(PROFILE_KEY, null);

  const firstName = document.getElementById("firstName");
  const lastName = document.getElementById("lastName");
  const email = document.getElementById("email");
  const phone = document.getElementById("phone");

  if (stored) {
    if (firstName) firstName.value = stored.firstName || "";
    if (lastName) lastName.value = stored.lastName || "";
    if (email) email.value = stored.email || "";
    if (phone) phone.value = stored.phone || "";
    fillSidebarName(stored);
  } else {
    // Primera vez: precargar email de la sesión
    if (email) email.value = getInitialEmail();
    fillSidebarName({ firstName: "", lastName: "" });
  }
}

// Maneja el guardado del perfil. Valida email y guarda en localStorage
// también actualiza el nombre del sidebar.
function saveUserProfile(e) {
  e?.preventDefault();

  const data = {
    firstName: document.getElementById("firstName")?.value.trim() || "",
    lastName: document.getElementById("lastName")?.value.trim() || "",
    email: document.getElementById("email")?.value.trim() || "",
    phone: document.getElementById("phone")?.value.trim() || "",
  };

  // Validación de email requerido
  if (!data.email) {
    alert("El email es obligatorio.");
    document.getElementById("email")?.focus();
    return;
  }

  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!re.test(data.email)) {
    alert("Email no válido");
    return;
  }

  writeLS(PROFILE_KEY, data);
  fillSidebarName(data);
  alert("Perfil guardado.");
}

// Restaura el formulario con los datos guardados.
// NO borra lo que está en localStorage.
function resetUserProfile(e) {
  e?.preventDefault();
  const stored = readLS(PROFILE_KEY, {
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
  });

  const firstName = document.getElementById("firstName");
  const lastName = document.getElementById("lastName");
  const email = document.getElementById("email");
  const phone = document.getElementById("phone");

  if (firstName) firstName.value = stored.firstName || "";
  if (lastName) lastName.value = stored.lastName || "";
  if (email) email.value = stored.email || "";
  if (phone) phone.value = stored.phone || "";
}

// ===== Foto de perfil - PREVIEW =====
// Configuración de los botones "Editar"  y "Eliminar".
// Solo actualiza el preview.
function setupPhotoActions() {
  const input = document.getElementById("profilePhotoInput");
  const preview = document.getElementById("profilePhotoPreview");
  const btnEdit = document.getElementById("btnPhotoEdit");
  const btnDel = document.getElementById("btnPhotoRemove");

  // EDITAR dispara el input file
  if (btnEdit && input) {
    btnEdit.addEventListener("click", () => input.click());
  }

  // Cuando el usuario elige un archivo, se muestra el preview
  if (input && preview) {
    input.addEventListener("change", (e) => {
      const file = e.target.files?.[0];
      if (!file) return;
      const url = URL.createObjectURL(file);
      preview.src = url;
      preview.addEventListener("load", () => URL.revokeObjectURL(url), {
        once: true,
      });
    });
  }

  // ELIMINAR vuelve a la imagen placeholder y limpia el input
  if (btnDel && preview && input) {
    btnDel.addEventListener("click", () => {
      preview.src = PLACEHOLDER_IMG;
      input.value = ""; // permite volver a seleccionar el mismo archivo
    });
  }
}

// ===== Tabs perfil =====
function setupTabs() {
  const buttons = document.querySelectorAll(".profile-tab-btn");
  const panels = document.querySelectorAll(".profile-panel");

  const show = (id) => {
    panels.forEach((p) =>
      p.id === id ? p.removeAttribute("hidden") : p.setAttribute("hidden", "")
    );
  };

  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      buttons.forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      show(btn.getAttribute("data-target"));
    });
  });

  // Asegura que mis datos esté visible al cargar
  show("panel-data");
}

// ===== Init =====
/**
 * Al cargar el DOM:
 * - Carga/Prellena el perfil
 * - Configura foto de perfil (preview)
 * - Configura tabs
 * - Conecta eventos de Guardar/Restablecer
 *
 * Nota: UI y logout ya se manejan en init.js (updateUserInterface, setupLogout)
 */
document.addEventListener("DOMContentLoaded", () => {
  loadUserProfile();
  setupPhotoActions();
  setupTabs();

  document
    .getElementById("profileForm")
    ?.addEventListener("submit", saveUserProfile);
  document
    .getElementById("btnSaveProfile")
    ?.addEventListener("click", saveUserProfile);
  document
    .getElementById("btnResetProfile")
    ?.addEventListener("click", resetUserProfile);
});
