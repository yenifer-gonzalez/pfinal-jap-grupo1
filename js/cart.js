// Utils
const readLS = (k, fb = null) => {
  try {
    return JSON.parse(localStorage.getItem(k)) ?? fb;
  } catch {
    return fb;
  }
};
const writeLS = (k, v) => localStorage.setItem(k, JSON.stringify(v));

// Estado
let cart = readLS('cart', []);

// Elementos
const listEl = document.getElementById('cartList');
const emptyEl = document.getElementById('emptyState');
const badgeEl = document.getElementById('cartBadge');
const subTotalEl = document.getElementById('subTotal');
const discountEl = document.getElementById('discount');
const grandTotalEl = document.getElementById('grandTotal');
const shippingRadios = () => [...document.querySelectorAll('input[name="ship"]')];

// Helpers
const EXCHANGE_RATE = 40; // 1 USD = 40 UYU

const money = (n, cur = 'USD') =>
  `${cur} ${Number(n).toLocaleString('en-US', { minimumFractionDigits: 0 })}`;

// Convierte cualquier precio a USD
const toUSD = (amount, currency) => {
  if (currency === 'UYU') {
    return amount / EXCHANGE_RATE;
  }
  return amount; // Si ya está en USD
};

// === FUNCIONES DE MODALES ===

// Modal
function showModal({ icon, iconClass, title, message, buttons }) {
  // Overlay del modal
  const modalOverlay = document.createElement('div');
  modalOverlay.className = 'modal-overlay';

  // Contenido del modal
  modalOverlay.innerHTML = `
    <div class="modal-content">
      <div class="modal-icon ${iconClass}">
        <i class="bi bi-${icon}"></i>
      </div>
      <h2 class="modal-title">${title}</h2>
      <p class="modal-message">${message}</p>
      <div class="modal-actions" id="modalActions"></div>
    </div>
  `;

  document.body.appendChild(modalOverlay);

  // Botones
  const actionsContainer = modalOverlay.querySelector('#modalActions');
  buttons.forEach((btn) => {
    const button = document.createElement('button');
    button.className = `modal-btn ${btn.className}`;
    button.textContent = btn.text;
    button.addEventListener('click', () => {
      closeModal(modalOverlay);
      if (btn.onClick) btn.onClick();
    });
    actionsContainer.appendChild(button);
  });

  // Modal con animación
  setTimeout(() => modalOverlay.classList.add('show'), 10);

  // Cerrar al hacer clic fuera del modal
  modalOverlay.addEventListener('click', (e) => {
    if (e.target === modalOverlay) {
      closeModal(modalOverlay);
      if (buttons.find((b) => b.isCancel)) {
        const cancelBtn = buttons.find((b) => b.isCancel);
        if (cancelBtn.onClick) cancelBtn.onClick();
      }
    }
  });

  return modalOverlay;
}

// Función para cerrar modal
function closeModal(modalElement) {
  modalElement.classList.remove('show');
  setTimeout(() => modalElement.remove(), 300);
}

// Modal de pago completado
function showPaymentSuccessModal() {
  showModal({
    icon: 'check-circle-fill',
    iconClass: 'success',
    title: '¡Pago completado!',
    message: 'Tu compra se ha procesado exitosamente. Gracias por tu compra.',
    buttons: [
      {
        text: 'Continuar comprando',
        className: 'modal-btn-secondary',
        onClick: () => {
          window.location.href = 'products.html';
        },
      },
      {
        text: 'Aceptar',
        className: 'modal-btn-primary',
        onClick: () => {
          // Limpiar el carrito después de la compra
          cart = [];
          writeLS('cart', cart);
          render();
        },
      },
    ],
  });
}

// Confirmación para eliminar producto
function showDeleteConfirmationModal(onConfirm, onCancel) {
  showModal({
    icon: 'exclamation-triangle-fill',
    iconClass: 'warning',
    title: '¿Eliminar producto?',
    message: '¿Estás seguro de que deseas eliminar este producto del carrito?',
    buttons: [
      {
        text: 'No',
        className: 'modal-btn-secondary',
        isCancel: true,
        onClick: onCancel,
      },
      {
        text: 'Sí, eliminar',
        className: 'modal-btn-danger',
        onClick: onConfirm,
      },
    ],
  });
}

function updateBadge() {
  const totalItems = cart.reduce((acc, it) => acc + (it.count ?? 1), 0);

  // Actualizar todos los badges en la página (puede haber múltiples en diferentes elementos)
  const badges = document.querySelectorAll('#cartBadge');
  badges.forEach((badge) => {
    if (totalItems > 0) {
      badge.textContent = totalItems;
      badge.style.display = 'inline-block';
    } else {
      badge.style.display = 'none';
    }
  });
}

function computeTotals() {
  // Convertir todo a USD antes de sumar
  const sub = cart.reduce((acc, it) => {
    const priceInUSD = toUSD(it.cost, it.currency || 'USD');
    return acc + priceInUSD * (it.count ?? 1);
  }, 0);

  const disc = 0;
  const shipPct = Number(shippingRadios().find((r) => r.checked)?.value || 0.15);
  const ship = sub * shipPct;
  const grand = sub - disc + ship;

  subTotalEl.textContent = money(sub);
  discountEl.textContent = money(disc);
  grandTotalEl.textContent = money(grand);
}

function renderEmpty() {
  listEl.innerHTML = '';
  emptyEl.classList.remove('hidden');
  computeTotals();
  updateBadge();
}

function renderItem(it, idx) {
  const row = document.createElement('div');
  row.className = 'cart-item';

  // Calcular subtotal para este producto
  const priceInUSD = toUSD(it.cost, it.currency || 'USD');
  const currentCount = it.count ?? 1;
  const subtotal = priceInUSD * currentCount;

  row.innerHTML = `
    <div class="prod">
      <img src="${it.image}" alt="${it.name}" loading="lazy">
      <div>
        <h4>${it.name}</h4>
        <small>Cat. ${it.category || '-'}</small>
      </div>
    </div>

    <div class="qty">
      <button class="btn-minus" aria-label="Restar">–</button>
      <input class="qty-input" type="number" min="1" value="${currentCount}">
      <button class="btn-plus" aria-label="Sumar">+</button>
    </div>

    <div class="price">
      <div class="price-info">
        <span class="subtotal">${money(subtotal, 'USD')}</span>
      </div>
      <button class="btn btn-sm remove" title="Eliminar producto">
        <i class="fa fa-trash"></i>
      </button>
    </div>
  `;

  // Elementos interactivos
  const remove = row.querySelector('.remove');
  const btnMinus = row.querySelector('.btn-minus');
  const btnPlus = row.querySelector('.btn-plus');
  const qtyInput = row.querySelector('.qty-input');
  const subtotalEl = row.querySelector('.subtotal');

  // Función para actualizar la cantidad y el subtotal en tiempo real
  const updateQuantity = (newCount) => {
    if (newCount < 1) newCount = 1;

    cart[idx].count = newCount;
    qtyInput.value = newCount;

    // Actualizar subtotal en tiempo real
    const newSubtotal = priceInUSD * newCount;
    subtotalEl.textContent = money(newSubtotal, 'USD');

    // Guardar en localStorage
    writeLS('cart', cart);

    // Actualizar totales y badge
    computeTotals();
    updateBadge();
  };

  // Evento botón menos
  btnMinus.addEventListener('click', () => {
    const newCount = parseInt(qtyInput.value) - 1;
    updateQuantity(newCount);
  });

  // Evento botón más
  btnPlus.addEventListener('click', () => {
    const newCount = parseInt(qtyInput.value) + 1;
    updateQuantity(newCount);
  });

  // Evento input directo
  qtyInput.addEventListener('input', (e) => {
    const newCount = parseInt(e.target.value) || 1;
    updateQuantity(newCount);
  });

  // Evento eliminar
  remove.addEventListener('click', () => {
    showDeleteConfirmationModal(() => {
      // Si confirma eliminar
      cart.splice(idx, 1);
      writeLS('cart', cart);
      render();
    });
  });

  return row;
}

function render() {
  cart = readLS('cart', []);
  if (!cart || cart.length === 0) return renderEmpty();

  emptyEl.classList.add('hidden');
  listEl.innerHTML = '';
  cart.forEach((it, idx) => listEl.appendChild(renderItem(it, idx)));

  updateBadge();
  computeTotals();
}

// Init
document.addEventListener('DOMContentLoaded', () => {
  render();

  // Recalcular totales al cambiar envío o al "aplicar" cupón
  shippingRadios().forEach((r) => r.addEventListener('change', computeTotals));
  document.getElementById('applyCoupon')?.addEventListener('click', computeTotals);

  // Botón para ir al checkout
  document.getElementById('checkoutBtn')?.addEventListener('click', () => {
    if (!cart.length) {
      return alert('Tu carrito está vacío.');
    }
    
    // Guardar datos del carrito para el checkout
    const sub = cart.reduce((acc, it) => {
      const priceInUSD = toUSD(it.cost, it.currency || 'USD');
      return acc + priceInUSD * (it.count ?? 1);
    }, 0);
    
    const shipPct = Number(shippingRadios().find((r) => r.checked)?.value || 0.15);
    const shipType = shippingRadios().find((r) => r.checked)?.parentElement?.textContent?.trim() || 'Premium 2 a 5 días (15%)';
    
    writeLS('checkoutData', {
      subtotal: sub,
      shippingCost: sub * shipPct,
      shippingType: shipType,
      total: sub + (sub * shipPct),
      items: cart
    });
    
    // Redirigir a checkout
    window.location.href = 'checkout.html';
  });
});
