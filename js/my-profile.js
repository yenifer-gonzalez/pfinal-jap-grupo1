const PROFILE_KEY = 'profileData';
const PLACEHOLDER_IMG = 'img/img_perfil.png';
const PROFILE_PHOTO_KEY = 'profilePhoto';
const ADDRESSES_KEY = 'userAddresses';
const MAX_ADDRESSES = 10;
const CARDS_KEY = 'userCards';
const MAX_CARDS = 5;
const ORDERS_KEY = 'orders';
const WISHLIST_KEY = 'wishlist';

// Reutiliza el formateador global de init.js
const formatMoney = money;

// === PERFIL BÁSICO (DATOS + NOMBRE) ===

// Obtiene el email inicial desde la sesión solo si es válido
function getInitialEmail() {
  try {
    const user = getCurrentUser();
    const email = user?.username || '';
    return email.includes('@') ? email : '';
  } catch {
    return '';
  }
}

// Completa el nombre en la tarjeta lateral (sidebar)
function fillSidebarName(data) {
  const el = document.getElementById('profileSidebarName');
  if (!el) return;
  const full = [data.firstName, data.lastName].filter(Boolean).join(' ').trim();
  el.textContent = full || 'Nombre Apellido';
}

// ==== Carga/guardado de perfil ====
function loadUserProfile() {
  const stored = readLS(PROFILE_KEY, null);

  const firstName = document.getElementById('firstName');
  const lastName = document.getElementById('lastName');
  const email = document.getElementById('email');
  const phone = document.getElementById('phone');

  if (stored) {
    if (firstName) firstName.value = stored.firstName || '';
    if (lastName) lastName.value = stored.lastName || '';
    if (email) email.value = stored.email || '';
    if (phone) phone.value = stored.phone || '';
    fillSidebarName(stored);
  } else {
    // Primera vez: precargar email de la sesión
    if (email) email.value = getInitialEmail();
    fillSidebarName({ firstName: '', lastName: '' });
  }
}

// Guarda el perfil (con validación de email) y actualiza el sidebar
function saveUserProfile(e) {
  e?.preventDefault();

  const data = {
    firstName: document.getElementById('firstName')?.value.trim() || '',
    lastName: document.getElementById('lastName')?.value.trim() || '',
    email: document.getElementById('email')?.value.trim() || '',
    phone: document.getElementById('phone')?.value.trim() || '',
  };

  // Validación de email requerido
  if (!data.email) {
    alert('El email es obligatorio.');
    document.getElementById('email')?.focus();
    return;
  }

  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!re.test(data.email)) {
    alert('Email no válido');
    return;
  }

  writeLS(PROFILE_KEY, data);
  fillSidebarName(data);
  alert('Perfil guardado.');
}

// Restaura el formulario a lo último guardado (no toca localStorage)
function resetUserProfile(e) {
  e?.preventDefault();
  const stored = readLS(PROFILE_KEY, {
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });

  const firstName = document.getElementById('firstName');
  const lastName = document.getElementById('lastName');
  const email = document.getElementById('email');
  const phone = document.getElementById('phone');

  if (firstName) firstName.value = stored.firstName || '';
  if (lastName) lastName.value = stored.lastName || '';
  if (email) email.value = stored.email || '';
  if (phone) phone.value = stored.phone || '';
}

// === Tabs perfil ===
function setupTabs() {
  const buttons = document.querySelectorAll('.profile-tab-btn');
  const panels = document.querySelectorAll('.profile-panel');

  const show = (id) => {
    panels.forEach((p) =>
      p.id === id ? p.removeAttribute('hidden') : p.setAttribute('hidden', '')
    );
  };

  buttons.forEach((btn) => {
    btn.addEventListener('click', () => {
      buttons.forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      show(btn.getAttribute('data-target'));
    });
  });

  // Panel por defecto
  show('panel-data');
}

// Foto persistente en base64
function loadPersistedPhoto() {
  const dataURL = readLS(PROFILE_PHOTO_KEY, null);
  const preview = document.getElementById('profilePhotoPreview');
  const avatar = document.getElementById('profileAvatar');
  if (!preview || !avatar) return;

  if (dataURL) {
    preview.src = dataURL;
    avatar.src = dataURL;
  } else {
    preview.src = PLACEHOLDER_IMG;
    avatar.src = PLACEHOLDER_IMG;
  }
}

// Convierte imagen a base64 y la guarda
function savePhotoToLocalStorage(file) {
  const reader = new FileReader();
  reader.onload = function (e) {
    const dataURL = e.target.result;
    writeLS(PROFILE_PHOTO_KEY, dataURL);
  };
  reader.readAsDataURL(file);
}

// === Foto de perfil - PREVIEW ===
function setupPhotoActions() {
  const input = document.getElementById('profilePhotoInput');
  const preview = document.getElementById('profilePhotoPreview');
  const avatar = document.getElementById('profileAvatar');
  const btnEdit = document.getElementById('btnPhotoEdit');
  const btnDel = document.getElementById('btnPhotoRemove');

  if (btnEdit && input) {
    btnEdit.addEventListener('click', () => input.click());
  }

  // Cambio de foto
  if (input && preview && avatar) {
    input.addEventListener('change', (e) => {
      const file = e.target.files?.[0];
      if (!file) return;

      // Vista previa inmediata
      const url = URL.createObjectURL(file);
      preview.src = url;
      avatar.src = url;
      preview.addEventListener('load', () => URL.revokeObjectURL(url), {
        once: true,
      });

      // Guardar versión base64 en localStorage
      savePhotoToLocalStorage(file);
    });
  }

  // Eliminar foto → placeholder
  if (btnDel && preview && input && avatar) {
    btnDel.addEventListener('click', () => {
      preview.src = PLACEHOLDER_IMG;
      avatar.src = PLACEHOLDER_IMG;
      input.value = '';
      localStorage.removeItem(PROFILE_PHOTO_KEY);
    });
  }
}

// === DIRECCIONES DE ENVÍO ===
function getAddresses() {
  return readLS(ADDRESSES_KEY, []);
}

// Guarda todas las direcciones en localStorage
function saveAddresses(addresses) {
  writeLS(ADDRESSES_KEY, addresses);
}

// Renderiza las direcciones en el DOM
function renderAddresses() {
  const container = document.getElementById('addressesList');
  if (!container) return;

  const addresses = getAddresses();

  if (addresses.length === 0) {
    container.innerHTML = `
      <div class="no-addresses">
        <i class="bi bi-geo-alt"></i>
        <h3>No tienes direcciones guardadas</h3>
        <p>Agrega una dirección para facilitar tus compras futuras</p>
      </div>
    `;
    return;
  }

  container.innerHTML = addresses
    .map(
      (addr) => `
    <div class="address-card ${addr.isDefault ? 'default' : ''}" data-id="${addr.id}">
      <div class="address-card-header">
        <div class="address-title">
          <h3>${addr.alias}</h3>
          ${
            addr.isDefault
              ? '<span class="badge-default"><i class="bi bi-star-fill"></i> Predeterminada</span>'
              : ''
          }
        </div>
        <div class="address-actions">
          ${
            !addr.isDefault
              ? `<button class="btn-address-action" onclick="setDefaultAddress('${addr.id}')" 
                   title="Establecer como predeterminada">
                   <i class="bi bi-star"></i>
                 </button>`
              : ''
          }
          <button class="btn-address-action" onclick="editAddress('${addr.id}')" title="Editar">
            <i class="bi bi-pencil"></i>
          </button>
          <button class="btn-address-action danger" onclick="deleteAddress('${
            addr.id
          }')" title="Eliminar">
            <i class="bi bi-trash"></i>
          </button>
        </div>
      </div>
      <div class="address-details">
        <p><strong>${addr.street}</strong>${addr.corner ? ` esquina ${addr.corner}` : ''}${
        addr.apartment ? `, ${addr.apartment}` : ''
      }</p>
        <p>${addr.city}, ${addr.state} ${addr.zipCode}</p>
        <p>${addr.country}</p>
        ${
          addr.phone
            ? `<div class="address-phone">
             <i class="bi bi-telephone"></i>
             <span>${addr.phone}</span>
           </div>`
            : ''
        }
        ${
          addr.instructions
            ? `<div class="address-instructions">
             <i class="bi bi-info-circle"></i> ${addr.instructions}
           </div>`
            : ''
        }
      </div>
    </div>
  `
    )
    .join('');
}

// Abre el modal para agregar/editar dirección
function openAddressModal(addressId = null) {
  const modal = document.getElementById('addressModal');
  const overlay = document.getElementById('modalOverlay');
  const form = document.getElementById('addressForm');
  const title = document.getElementById('addressModalTitle');

  if (!modal || !overlay || !form) return;

  // Resetea el formulario
  form.reset();
  document.getElementById('addressId').value = '';

  // Actualiza el título
  if (title) {
    title.textContent = addressId ? 'Editar dirección' : 'Agregar dirección';
  }

  // Si es edición, carga los datos
  if (addressId) {
    document.getElementById('addressId').value = addressId;
    const addresses = getAddresses();
    const address = addresses.find((a) => a.id === addressId);
    if (address) {
      document.getElementById('addressAlias').value = address.alias || '';
      document.getElementById('addressStreet').value = address.street || '';
      document.getElementById('addressCorner').value = address.corner || '';
      document.getElementById('addressApartment').value = address.apartment || '';
      document.getElementById('addressCity').value = address.city || '';
      document.getElementById('addressState').value = address.state || '';
      document.getElementById('addressZipCode').value = address.zipCode || '';
      document.getElementById('addressCountry').value = address.country || '';
      document.getElementById('addressPhone').value = address.phone || '';
      document.getElementById('addressInstructions').value = address.instructions || '';
      document.getElementById('addressIsDefault').checked = address.isDefault || false;
    }
  }

  modal.classList.add('show');
  overlay.classList.add('show');
  document.body.style.overflow = 'hidden';
}

// Cierra el modal
function closeAddressModal() {
  const modal = document.getElementById('addressModal');
  const overlay = document.getElementById('modalOverlay');

  if (!modal || !overlay) return;

  modal.classList.remove('show');
  overlay.classList.remove('show');
  document.body.style.overflow = '';
}

// Guarda una dirección (nueva o editada)
function saveAddress(e) {
  e.preventDefault();

  const editingId = document.getElementById('addressId').value;

  const addressData = {
    alias: document.getElementById('addressAlias').value.trim(),
    street: document.getElementById('addressStreet').value.trim(),
    corner: document.getElementById('addressCorner').value.trim(),
    apartment: document.getElementById('addressApartment').value.trim(),
    city: document.getElementById('addressCity').value.trim(),
    state: document.getElementById('addressState').value.trim(),
    zipCode: document.getElementById('addressZipCode').value.trim(),
    country: document.getElementById('addressCountry').value.trim(),
    phone: document.getElementById('addressPhone').value.trim(),
    instructions: document.getElementById('addressInstructions').value.trim(),
    isDefault: document.getElementById('addressIsDefault').checked,
  };

  // Validaciones básicas
  if (!addressData.alias || !addressData.street || !addressData.city) {
    alert('Por favor completa todos los campos obligatorios.');
    return;
  }

  let addresses = getAddresses();

  if (editingId) {
    // Edición
    const index = addresses.findIndex((a) => a.id === editingId);
    if (index !== -1) {
      addresses[index] = {
        ...addresses[index],
        ...addressData,
        updatedAt: new Date().toISOString(),
      };
    }
  } else {
    // Nueva dirección
    if (addresses.length >= MAX_ADDRESSES) {
      alert(`No puedes agregar más de ${MAX_ADDRESSES} direcciones.`);
      return;
    }

    const newAddress = {
      id: 'addr_' + Date.now(),
      ...addressData,
      createdAt: new Date().toISOString(),
    };

    addresses.push(newAddress);
  }

  // Si se marca como predeterminada, desmarcar el resto
  if (addressData.isDefault) {
    const targetId = editingId || addresses[addresses.length - 1].id;
    addresses = addresses.map((addr) => ({
      ...addr,
      isDefault: addr.id === targetId,
    }));
  }

  // Si no hay ninguna predeterminada, marca la primera
  if (!addresses.some((a) => a.isDefault) && addresses.length > 0) {
    addresses[0].isDefault = true;
  }

  saveAddresses(addresses);
  renderAddresses();
  closeAddressModal();
}

// Establece una dirección como predeterminada
window.setDefaultAddress = function (addressId) {
  const addresses = getAddresses().map((addr) => ({
    ...addr,
    isDefault: addr.id === addressId,
  }));

  saveAddresses(addresses);
  renderAddresses();
};

// Edita una dirección existente
window.editAddress = function (addressId) {
  openAddressModal(addressId);
};

// Elimina una dirección
window.deleteAddress = function (addressId) {
  if (!confirm('¿Estás seguro de eliminar esta dirección?')) return;

  let addresses = getAddresses().filter((addr) => addr.id !== addressId);

  // Si no hay predeterminada, marca la primera
  if (!addresses.some((a) => a.isDefault) && addresses.length > 0) {
    addresses[0].isDefault = true;
  }

  saveAddresses(addresses);
  renderAddresses();
  closeAddressModal();
};

// Configuración de eventos del modal y formulario
function setupAddressesSystem() {
  // Botón agregar dirección
  const btnAdd = document.getElementById('btnAddAddress');
  if (btnAdd) {
    btnAdd.addEventListener('click', () => openAddressModal());
  }

  // Botón cerrar modal
  const btnClose = document.getElementById('closeAddressModalBtn');
  if (btnClose) {
    btnClose.addEventListener('click', closeAddressModal);
  }

  // Botón cancelar
  const btnCancel = document.getElementById('cancelAddressModal');
  if (btnCancel) {
    btnCancel.addEventListener('click', (e) => {
      e.preventDefault();
      closeAddressModal();
    });
  }

  // Cerrar modal al hacer clic en el overlay
  const overlay = document.getElementById('modalOverlay');
  if (overlay) {
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        const addressModal = document.getElementById('addressModal');
        if (addressModal?.classList.contains('show')) {
          closeAddressModal();
        }
      }
    });
  }

  // Cerrar con ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const modal = document.getElementById('addressModal');
      if (modal && modal.classList.contains('show')) {
        closeAddressModal();
      }
    }
  });

  // Formulario
  const form = document.getElementById('addressForm');
  if (form) {
    form.addEventListener('submit', saveAddress);
  }

  // Render inicial
  renderAddresses();
}

// === SISTEMA DE TARJETAS DE PAGO ===

function getCards() {
  return readLS(CARDS_KEY, []);
}

function saveCards(cards) {
  writeLS(CARDS_KEY, cards);
}

function detectCardBrand(number) {
  const cleaned = number.replace(/\s/g, '');

  if (/^4/.test(cleaned)) return 'visa';
  if (/^5[1-5]/.test(cleaned)) return 'mastercard';
  if (/^3[47]/.test(cleaned)) return 'amex';

  return 'other';
}

function formatCardNumber(value) {
  const cleaned = value.replace(/\s/g, '');
  const chunks = cleaned.match(/.{1,4}/g) || [];
  return chunks.join(' ');
}

function maskCardNumber(number) {
  const last4 = number.slice(-4);
  return `•••• •••• •••• ${last4}`;
}

function formatCardExpiry(value) {
  const cleaned = value.replace(/\D/g, '');
  if (cleaned.length >= 2) {
    return cleaned.slice(0, 2) + '/' + cleaned.slice(2, 4);
  }
  return cleaned;
}

function validateCardExpiry(expiry) {
  const [month, year] = expiry.split('/');
  if (!month || !year) return false;

  const monthNum = parseInt(month);
  const yearNum = parseInt('20' + year);

  if (monthNum < 1 || monthNum > 12) return false;

  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1;

  if (yearNum < currentYear) return false;
  if (yearNum === currentYear && monthNum < currentMonth) return false;

  return true;
}

function renderCards() {
  const cards = getCards();
  const cardsList = document.getElementById('cardsList');

  if (!cardsList) return;

  if (cards.length === 0) {
    cardsList.innerHTML = `
      <div class="no-addresses">
        <i class="bi bi-credit-card"></i>
        <h3>No tienes tarjetas guardadas</h3>
        <p>Agrega una tarjeta para facilitar tus compras futuras</p>
      </div>
    `;
    return;
  }

  cardsList.innerHTML = cards
    .map((card) => {
      const brandClass = card.brand || 'other';
      const defaultClass = card.isDefault ? 'default' : '';
      const brandIcon =
        {
          visa: 'bi-credit-card-2-front',
          mastercard: 'bi-credit-card-2-back',
          amex: 'bi-credit-card',
          other: 'bi-credit-card',
        }[card.brand] || 'bi-credit-card';

      return `
        <div class="card-item ${brandClass} ${defaultClass}">
          ${card.alias ? `<div class="card-alias">${card.alias}</div>` : ''}
          
          <div class="card-item-header">
            <div class="card-brand">
              <i class="bi ${brandIcon}"></i>
              ${card.brand ? card.brand.toUpperCase() : 'TARJETA'}
            </div>
            ${
              card.isDefault
                ? '<span class="card-badge-default"><i class="bi bi-star-fill"></i> Predeterminada</span>'
                : ''
            }
          </div>

          <div class="card-chip"></div>

          <div class="card-number-display">
            ${maskCardNumber(card.lastFour)}
          </div>

          <div class="card-info">
            <div class="card-holder">
              <div class="card-holder-label">Titular</div>
              <div class="card-holder-name">${card.cardName}</div>
            </div>
            <div class="card-expiry-section">
              <div class="card-expiry-label">Vence</div>
              <div class="card-expiry-value">${card.expiry}</div>
            </div>
          </div>

          <div class="card-actions">
            ${
              !card.isDefault
                ? `<button type="button" class="btn-card-action btn-set-default" 
                     onclick="setDefaultCard('${card.id}')" 
                     aria-label="Establecer como predeterminada">
                    <i class="bi bi-star"></i>
                  </button>`
                : ''
            }
            <button type="button" class="btn-card-action btn-edit" 
                    onclick="editCard('${card.id}')" 
                    aria-label="Editar tarjeta">
              <i class="bi bi-pencil"></i>
            </button>
            <button type="button" class="btn-card-action btn-delete" 
                    onclick="deleteCard('${card.id}')" 
                    aria-label="Eliminar tarjeta">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </div>
      `;
    })
    .join('');
}

function openCardModal(cardId = null) {
  const modal = document.getElementById('cardModal');
  const overlay = document.getElementById('modalOverlay');
  const form = document.getElementById('cardForm');
  const title = document.getElementById('cardModalTitle');

  if (!modal || !overlay || !form) return;

  // Limpiar formulario
  form.reset();
  document.getElementById('cardId').value = '';

  if (cardId) {
    // Modo edición
    title.textContent = 'Editar tarjeta de pago';
    const cards = getCards();
    const card = cards.find((c) => c.id === cardId);

    if (card) {
      document.getElementById('cardId').value = card.id;
      document.getElementById('cardNumber').value = maskCardNumber(card.lastFour);
      document.getElementById('cardNumber').disabled = true; // No permitir editar número
      document.getElementById('cardName').value = card.cardName;
      document.getElementById('cardExpiry').value = card.expiry;
      document.getElementById('cardAlias').value = card.alias || '';
      document.getElementById('cardIsDefault').checked = card.isDefault;
    }
  } else {
    // Modo agregar
    title.textContent = 'Agregar tarjeta de pago';
    document.getElementById('cardNumber').disabled = false;
  }

  modal.classList.add('show');
  overlay.classList.add('show');
  document.body.style.overflow = 'hidden';
}

function closeCardModal() {
  const modal = document.getElementById('cardModal');
  const overlay = document.getElementById('modalOverlay');

  if (!modal || !overlay) return;

  modal.classList.remove('show');
  overlay.classList.remove('show');
  document.body.style.overflow = '';
}

function saveCard(e) {
  e.preventDefault();

  const cardId = document.getElementById('cardId').value;
  const cardNumber = document.getElementById('cardNumber').value.replace(/\s/g, '');
  const cardName = document.getElementById('cardName').value.trim();
  const cardExpiry = document.getElementById('cardExpiry').value.trim();
  const cardCvv = document.getElementById('cardCvv').value.trim();
  const cardAlias = document.getElementById('cardAlias').value.trim();
  const cardIsDefault = document.getElementById('cardIsDefault').checked;

  // Validaciones
  if (!cardName) {
    alert('Por favor, ingresa el nombre del titular de la tarjeta');
    return;
  }

  if (!cardExpiry || !validateCardExpiry(cardExpiry)) {
    alert('Por favor, ingresa una fecha de vencimiento válida (MM/AA) y futura');
    return;
  }

  if (!cardId) {
    // Validar número y CVV solo al agregar
    if (!cardNumber || cardNumber.length < 13) {
      alert('Por favor, ingresa un número de tarjeta válido');
      return;
    }

    if (!cardCvv || cardCvv.length < 3) {
      alert('Por favor, ingresa un CVV válido');
      return;
    }
  }

  let cards = getCards();

  if (cardId) {
    // Actualizar tarjeta existente
    cards = cards.map((card) => {
      if (card.id === cardId) {
        return {
          ...card,
          cardName,
          expiry: cardExpiry,
          alias: cardAlias,
          isDefault: cardIsDefault,
          updatedAt: new Date().toISOString(),
        };
      }
      // Si la editada se marca como predeterminada, desmarcar otras
      if (cardIsDefault && card.isDefault) {
        return { ...card, isDefault: false };
      }
      return card;
    });
  } else {
    // Agregar nueva tarjeta
    if (cards.length >= MAX_CARDS) {
      alert(`No puedes agregar más de ${MAX_CARDS} tarjetas`);
      return;
    }

    const lastFour = cardNumber.slice(-4);
    const brand = detectCardBrand(cardNumber);

    // Si es la primera tarjeta o se marca como predeterminada
    const isDefault = cards.length === 0 || cardIsDefault;

    // Si se marca como predeterminada, quitar el flag de las demás
    if (isDefault) {
      cards = cards.map((card) => ({ ...card, isDefault: false }));
    }

    const newCard = {
      id: 'card_' + Date.now(),
      lastFour: lastFour,
      cardName,
      expiry: cardExpiry,
      brand,
      alias: cardAlias,
      isDefault,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    cards.push(newCard);
  }

  saveCards(cards);
  renderCards();
  closeCardModal();
}

// === Establece una tarjeta como predeterminada ===
window.setDefaultCard = function (cardId) {
  const cards = getCards();
  const updatedCards = cards.map((card) => ({
    ...card,
    isDefault: card.id === cardId,
    updatedAt: card.id === cardId ? new Date().toISOString() : card.updatedAt,
  }));

  saveCards(updatedCards);
  renderCards();
};

// === Edita una tarjeta ===
window.editCard = function (cardId) {
  openCardModal(cardId);
};

// === Elimina una tarjeta ===
window.deleteCard = function (cardId) {
  const cards = getCards();
  const card = cards.find((c) => c.id === cardId);
  if (!card) return;

  const confirmMsg = card.alias
    ? `¿Estás seguro de eliminar la tarjeta "${card.alias}"?`
    : `¿Estás seguro de eliminar esta tarjeta terminada en ${card.lastFour}?`;

  if (!confirm(confirmMsg)) return;

  const updatedCards = cards.filter((c) => c.id !== cardId);

  // Si se eliminó la predeterminada y hay más tarjetas, hacer predeterminada la primera
  if (card.isDefault && updatedCards.length > 0) {
    updatedCards[0].isDefault = true;
    updatedCards[0].updatedAt = new Date().toISOString();
  }

  saveCards(updatedCards);
  renderCards();
};

// === Configura el sistema de tarjetas ===
function setupCardsSystem() {
  const btnAddCard = document.getElementById('btnAddCard');
  const closeCardModalBtn = document.getElementById('closeCardModal');
  const cancelCardModalBtn = document.getElementById('cancelCardModal');
  const cardForm = document.getElementById('cardForm');
  const overlay = document.getElementById('modalOverlay');
  const cardNumberInput = document.getElementById('cardNumber');
  const cardExpiryInput = document.getElementById('cardExpiry');
  const cardCvvInput = document.getElementById('cardCvv');

  // Abrir modal
  btnAddCard?.addEventListener('click', () => openCardModal());

  // Cerrar modal
  closeCardModalBtn?.addEventListener('click', closeCardModal);
  cancelCardModalBtn?.addEventListener('click', closeCardModal);

  // Cerrar al hacer click en el overlay
  overlay?.addEventListener('click', (e) => {
    if (e.target === overlay) {
      const cardModal = document.getElementById('cardModal');
      if (cardModal?.classList.contains('show')) {
        closeCardModal();
      }
    }
  });

  // Cerrar con ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      const cardModal = document.getElementById('cardModal');
      if (cardModal?.classList.contains('show')) {
        closeCardModal();
      }
    }
  });

  // Formateo automático del número de tarjeta
  cardNumberInput?.addEventListener('input', (e) => {
    let value = e.target.value.replace(/\s/g, '');
    value = value.replace(/\D/g, ''); // Solo números
    e.target.value = formatCardNumber(value);
  });

  // Formateo automático de la fecha de vencimiento
  cardExpiryInput?.addEventListener('input', (e) => {
    let value = e.target.value;
    e.target.value = formatCardExpiry(value);
  });

  // Solo números en CVV
  cardCvvInput?.addEventListener('input', (e) => {
    e.target.value = e.target.value.replace(/\D/g, '');
  });

  // Guardar tarjeta
  cardForm?.addEventListener('submit', saveCard);

  // Renderizar tarjetas al cargar
  renderCards();
}

// === SISTEMA DE PEDIDOS ===

// Obtiene los pedidos del localStorage
function getOrders() {
  return readLS(ORDERS_KEY, []);
}

// Obtiene el nombre del estado en español
function getStatusName(status) {
  const statusMap = {
    pending: 'Pendiente',
    confirmed: 'Confirmado',
    completed: 'Completado',
  };
  return statusMap[status] || status;
}

// Obtiene el ícono del estado //
function getStatusIcon(status) {
  const iconMap = {
    pending: 'bi-clock-history',
    confirmed: 'bi-check-circle',
    completed: 'bi-check-all',
  };
  return iconMap[status] || 'bi-box-seam';
}

// Renderiza los pedidos
function renderOrders(filter = 'all') {
  const container = document.getElementById('ordersList');
  if (!container) return;

  let orders = getOrders();

  // Filtrar pedidos
  if (filter !== 'all') {
    orders = orders.filter((order) => order.status === filter);
  }

  // Ordenar por fecha (más reciente primero)
  orders.sort((a, b) => new Date(b.date) - new Date(a.date));

  if (orders.length === 0) {
    container.innerHTML = `
      <div class="no-orders">
        <i class="bi bi-inbox"></i>
        <h3>No hay pedidos ${filter !== 'all' ? getStatusName(filter).toLowerCase() + 's' : ''}</h3>
        <p>Tus pedidos aparecerán aquí</p>
      </div>
    `;
    return;
  }

  container.innerHTML = orders
    .map(
      (order) => `
    <div class="order-card" data-status="${order.status}">
      <!-- Header -->
      <div class="order-header">
        <div class="order-info">
          <span class="order-number">#${order.id}</span>
          <span class="order-date">
            <i class="bi bi-calendar3"></i>
            ${formatDate(order.date)}
          </span>
        </div>
        <span class="order-status ${order.status}">
          <i class="${getStatusIcon(order.status)}"></i>
          ${getStatusName(order.status)}
        </span>
      </div>

      <!-- Content -->
      <div class="order-content">
        <!-- Items -->
        <div class="order-items">
          ${order.items
            .slice(0, 3)
            .map(
              (item) => `
            <div class="order-item">
              <img src="${item.image}" alt="${item.name}" class="order-item-image" />
              <div class="order-item-details">
                <p class="order-item-name">${item.name}</p>
                <span class="order-item-quantity">Cantidad: ${item.count || 1}</span>
              </div>
              <span class="order-item-price">${formatMoney(
                item.cost * (item.count || 1),
                'USD'
              )}</span>
            </div>
          `
            )
            .join('')}
          ${
            order.items.length > 3
              ? `<p style="color: var(--text-secondary); font-size: 0.9rem; margin: 0;">Y ${
                  order.items.length - 3
                } producto(s) más...</p>`
              : ''
          }
        </div>

        <!-- Summary -->
        <div class="order-summary">
          <div class="order-total">
            <span class="order-total-label">Total del pedido</span>
            <span class="order-total-amount">${formatMoney(order.total, 'USD')}</span>
          </div>
          <div class="order-actions">
            <button class="btn-order-action primary" onclick="viewOrderDetails('${order.id}')">
              <i class="bi bi-eye"></i>
              Ver detalles completos
            </button>
          </div>
        </div>
      </div>
    </div>
  `
    )
    .join('');
}

// Ver detalles del pedido (redirige a order-confirmation)
window.viewOrderDetails = function (orderId) {
  window.location.href = `order-confirmation.html?order=${orderId}`;
};

// Configura el sistema de pedidos
function setupOrdersSystem() {
  // Renderizar pedidos inicialmente
  renderOrders();

  // Event listeners para filtros
  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach((btn) => {
    btn.addEventListener('click', function () {
      // Remover active de todos
      filterBtns.forEach((b) => b.classList.remove('active'));

      // Agregar active al clickeado
      this.classList.add('active');

      // Filtrar pedidos
      const filter = this.dataset.filter;
      renderOrders(filter);
    });
  });
}

// === SISTEMA DE FAVORITOS/WISHLIST ===

// Obtiene los favoritos del localStorage
function getFavorites() {
  return readLS(WISHLIST_KEY, []);
}

// Renderiza los productos favoritos
function renderFavorites() {
  const favoritesList = document.getElementById('favoritesList');
  if (!favoritesList) return;

  const favorites = getFavorites();

  if (favorites.length === 0) {
    favoritesList.innerHTML = `
      <div class="no-favorites">
        <i class="bi bi-heart"></i>
        <h3>No tienes productos favoritos</h3>
        <p>Explora nuestro catálogo y guarda tus productos preferidos aquí</p>
        <a href="products.html" class="btn-view-products">
          <i class="bi bi-shop"></i> Ver productos
        </a>
      </div>
    `;
    return;
  }

  favoritesList.innerHTML = favorites
    .map(
      (item) => `
    <div class="favorite-card">
      <button class="favorite-remove-btn" onclick="removeFromFavorites('${
        item.productId
      }')" aria-label="Eliminar de favoritos">
        <i class="bi bi-x-lg"></i>
      </button>
      <div class="favorite-image" onclick="goToProductFromFavorites('${
        item.productId
      }')" style="cursor: pointer;">
        <img src="${item.image}" alt="${
        item.name
      }" loading="lazy" onerror="this.src='img/cars_index.jpg'">
      </div>
      <div class="favorite-details">
        <h3 class="favorite-name">${item.name}</h3>
        <p class="favorite-description">${item.description}</p>
        <div class="favorite-meta">
          <span class="favorite-price">${formatMoney(item.cost, item.currency)}</span>
          <span class="favorite-sold">
            <i class="bi bi-box-seam"></i>
            ${item.soldCount} vendidos
          </span>
        </div>
        <div class="favorite-actions">
          <button class="btn-favorite-action primary" onclick="goToProductFromFavorites('${
            item.productId
          }')">
            <i class="bi bi-eye"></i> Ver producto
          </button>
          <button class="btn-favorite-action secondary" onclick="addFavoriteToCart('${
            item.productId
          }')">
            <i class="bi bi-cart-plus"></i> Agregar al carrito
          </button>
        </div>
      </div>
    </div>
  `
    )
    .join('');
}

// Navega al detalle del producto desde favoritos
window.goToProductFromFavorites = function (productId) {
  localStorage.setItem('selectedProduct', productId);
  window.location.href = 'product-info.html';
};

// Elimina un producto de favoritos
window.removeFromFavorites = function (productId) {
  let wishlist = getFavorites();
  wishlist = wishlist.filter((item) => item.productId != productId);
  writeLS(WISHLIST_KEY, wishlist);
  renderFavorites();
};

// Agrega un producto de favoritos al carrito
window.addFavoriteToCart = function (productId) {
  const favorites = getFavorites();
  const product = favorites.find((item) => item.productId == productId);

  if (!product) return;

  // Obtener el carrito actual
  let cart = readLS('cart', []);

  // Verificar si ya está en el carrito
  const existingIndex = cart.findIndex((item) => item.id == productId);

  if (existingIndex !== -1) {
    const item = cart[existingIndex];
    const current =
      typeof item.count === 'number'
        ? item.count
        : typeof item.quantity === 'number'
        ? item.quantity
        : 0;

    item.count = current + 1;
    delete item.quantity;
  } else {
    // Agregar nuevo producto al carrito
    cart.push({
      id: product.productId,
      name: product.name,
      description: product.description,
      cost: product.cost,
      currency: product.currency,
      image: product.image,
      count: 1,
    });
  }

  // Guardar carrito actualizado
  writeLS('cart', cart);

  // Actualizar badge si existe la función
  if (typeof updateCartBadge === 'function') {
    updateCartBadge();
  }

  // Mostrar notificación
  showFavoriteNotification(product.name);
};

// Muestra notificación al agregar al carrito desde favoritos
function showFavoriteNotification(productName) {
  const notification = document.createElement('div');
  notification.className = 'cart-notification';
  notification.innerHTML = `
    <i class="bi bi-check-circle-fill"></i>
    <span>¡${productName} agregado al carrito!</span>
  `;

  document.body.appendChild(notification);

  setTimeout(() => {
    notification.classList.add('show');
  }, 10);

  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => notification.remove(), 300);
  }, 3000);
}

// Configura el sistema de favoritos
function setupFavoritesSystem() {
  renderFavorites();
}

// === INICIALIZACIÓN ===

document.addEventListener('DOMContentLoaded', () => {
  loadUserProfile();
  loadPersistedPhoto();
  setupPhotoActions();
  setupTabs();
  setupAddressesSystem();
  setupCardsSystem();
  setupOrdersSystem();
  setupFavoritesSystem();

  // Param "tab" en la URL para abrir sección específica
  const urlParams = new URLSearchParams(window.location.search);
  const tab = urlParams.get('tab');

  if (tab === 'orders') {
    document.getElementById('tab-orders')?.click();
  } else if (tab === 'favorites') {
    document.getElementById('tab-favorites')?.click();
  }

  document.getElementById('profileForm')?.addEventListener('submit', saveUserProfile);
  document.getElementById('btnResetProfile')?.addEventListener('click', resetUserProfile);
});
