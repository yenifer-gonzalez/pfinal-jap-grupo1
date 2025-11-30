// Estado
let checkoutData = readLS('checkoutData', null);
let selectedAddress = null;
let selectedPaymentMethod = 'card';
let selectedCard = null;

// ===== INICIALIZACIÓN =====
document.addEventListener('DOMContentLoaded', () => {
  // Verificar que hay datos de checkout
  if (!checkoutData || !checkoutData.items || checkoutData.items.length === 0) {
    alert('No hay productos en el carrito.');
    window.location.href = 'cart.html';
    return;
  }

  // Cargar datos
  loadSavedAddresses();
  loadSavedCards();
  loadOrderSummary();
  setupPaymentMethods();
  setupEventListeners();
});

// ===== DIRECCIONES =====
function loadSavedAddresses() {
  const container = document.getElementById('savedAddresses');
  const addresses = readLS('userAddresses', []);

  if (addresses.length === 0) {
    container.innerHTML = `
      <div class="no-addresses-message">
        <i class="bi bi-geo-alt"></i>
        <p><strong>No tienes direcciones guardadas</strong></p>
        <p>Usa el formulario a continuación o <a href="my-profile.html">agrega una en tu perfil</a></p>
      </div>
    `;
    // Mostrar automáticamente el formulario de nueva dirección
    document.getElementById('newAddressForm').classList.remove('hidden');
    return;
  }

  // Encontrar dirección predeterminada
  const defaultAddress = addresses.find((addr) => addr.isDefault) || addresses[0];
  selectedAddress = defaultAddress;

  container.innerHTML = addresses
    .map(
      (addr) => `
    <label class="address-option ${
      addr.id === defaultAddress.id ? 'selected' : ''
    }" data-address-id="${addr.id}">
      <input 
        type="radio" 
        name="shippingAddress" 
        value="${addr.id}"
        ${addr.id === defaultAddress.id ? 'checked' : ''}
      />
      <div class="address-info">
        <h4>
          ${addr.alias}
          ${
            addr.isDefault
              ? '<span class="badge-default"><i class="bi bi-star-fill"></i> Predeterminada</span>'
              : ''
          }
        </h4>
        <p>
          ${addr.street}${addr.corner ? ` esquina ${addr.corner}` : ''}${
        addr.apartment ? `, ${addr.apartment}` : ''
      }
        </p>
        <p>${addr.city}, ${addr.state} ${addr.zipCode}</p>
        ${addr.phone ? `<p class="phone"><i class="bi bi-telephone"></i> ${addr.phone}</p>` : ''}
      </div>
    </label>
  `
    )
    .join('');

  // Event listeners para selección de dirección
  document.querySelectorAll('input[name="shippingAddress"]').forEach((radio) => {
    radio.addEventListener('change', (e) => {
      const addressId = e.target.value;
      selectedAddress = addresses.find((a) => a.id === addressId);

      // Actualizar visualización
      document.querySelectorAll('.address-option').forEach((opt) => {
        opt.classList.toggle('selected', opt.dataset.addressId === addressId);
      });
    });
  });
}

// ===== TARJETAS =====
function loadSavedCards() {
  const container = document.getElementById('savedCards');
  const cardsContainer = document.getElementById('savedCardsContainer');
  const newCardForm = document.getElementById('newCardForm');
  const cards = readLS('userCards', []);

  if (!container) return;

  if (cards.length === 0) {
    // Si no hay tarjetas, ocultar el contenedor y mostrar el formulario
    if (cardsContainer) cardsContainer.style.display = 'none';
    if (newCardForm) {
      newCardForm.classList.remove('hidden');
      newCardForm.style.marginTop = '0';
    }
    return;
  }

  // Mostrar contenedor de tarjetas
  if (cardsContainer) cardsContainer.style.display = 'block';

  // Encontrar tarjeta predeterminada
  const defaultCard = cards.find((card) => card.isDefault) || cards[0];
  selectedCard = defaultCard;

  // Enmascara número de tarjeta
  const maskCardNumber = (lastFour) => {
    return '•••• •••• •••• ' + lastFour;
  };

  // Detecta icono de marca
  const getCardIcon = (brand) => {
    const brandLower = brand ? brand.toLowerCase() : '';
    const icons = {
      visa: 'fa fa-cc-visa',
      mastercard: 'fa fa-cc-mastercard',
      amex: 'fa fa-cc-amex',
    };
    return icons[brandLower] || 'bi bi-credit-card';
  };

  // Capitaliza primera letra
  const capitalize = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  container.innerHTML = cards
    .map(
      (card) => `
    <label class="address-option ${card.id === defaultCard.id ? 'selected' : ''}" data-card-id="${
        card.id
      }">
      <input 
        type="radio" 
        name="paymentCard" 
        value="${card.id}"
        ${card.id === defaultCard.id ? 'checked' : ''}
      />
      <div class="address-info">
        <h4>
          ${card.alias || capitalize(card.brand)}
          ${
            card.isDefault
              ? '<span class="badge-default"><i class="bi bi-star-fill"></i> Predeterminada</span>'
              : ''
          }
        </h4>
        <p>
          <i class="${getCardIcon(card.brand)}"></i>
          ${maskCardNumber(card.lastFour)}
        </p>
        <p class="phone">${card.cardName} • Vence ${card.expiry}</p>
      </div>
    </label>
  `
    )
    .join('');

  // Event listeners para selección de tarjeta
  document.querySelectorAll('input[name="paymentCard"]').forEach((radio) => {
    radio.addEventListener('change', (e) => {
      const cards = readLS('userCards', []);
      selectedCard = cards.find((card) => card.id === e.target.value);

      // Actualizar clases de selección
      document.querySelectorAll('.address-option[data-card-id]').forEach((opt) => {
        opt.classList.remove('selected');
      });
      e.target.closest('.address-option').classList.add('selected');

      // Ocultar formulario de nueva tarjeta si hay una seleccionada
      if (newCardForm) {
        newCardForm.classList.add('hidden');
        const toggleBtn = document.getElementById('toggleNewCard');
        if (toggleBtn) {
          toggleBtn.innerHTML = '<i class="bi bi-plus-circle"></i> Usar una tarjeta diferente';
        }
      }
    });
  });

  // Inicialmente ocultar el formulario si hay tarjetas
  if (newCardForm) newCardForm.classList.add('hidden');
}

// Toggle nueva dirección
function setupEventListeners() {
  const toggleBtn = document.getElementById('toggleNewAddress');
  const newAddressForm = document.getElementById('newAddressForm');

  if (toggleBtn) {
    toggleBtn.addEventListener('click', () => {
      const isHidden = newAddressForm.classList.contains('hidden');
      newAddressForm.classList.toggle('hidden');
      toggleBtn.innerHTML = isHidden
        ? '<i class="bi bi-dash-circle"></i> Ocultar formulario'
        : '<i class="bi bi-plus-circle"></i> Usar una dirección diferente';
    });
  }

  // Guardar nueva dirección
  const saveBtn = document.getElementById('saveNewAddress');
  if (saveBtn) {
    saveBtn.addEventListener('click', saveNewAddress);
  }

  // Confirmar compra
  const confirmBtn = document.getElementById('confirmPurchase');
  if (confirmBtn) {
    confirmBtn.addEventListener('click', confirmPurchase);
  }

  // Formateo de campos de tarjeta
  setupCardFormatting();

  // Guardar nueva tarjeta
  const saveCardBtn = document.getElementById('saveNewCard');
  if (saveCardBtn) {
    saveCardBtn.addEventListener('click', saveNewCard);
  }

  // Toggle nueva tarjeta
  const toggleCardBtn = document.getElementById('toggleNewCard');
  const newCardForm = document.getElementById('newCardForm');

  if (toggleCardBtn && newCardForm) {
    toggleCardBtn.addEventListener('click', () => {
      const isHidden = newCardForm.classList.contains('hidden');
      newCardForm.classList.toggle('hidden');
      toggleCardBtn.innerHTML = isHidden
        ? '<i class="bi bi-dash-circle"></i> Ocultar formulario'
        : '<i class="bi bi-plus-circle"></i> Usar una tarjeta diferente';

      // Si se muestra el formulario, deseleccionar tarjetas guardadas
      if (isHidden) {
        selectedCard = null;
        document.querySelectorAll('input[name="paymentCard"]').forEach((radio) => {
          radio.checked = false;
        });
        document.querySelectorAll('.address-option[data-card-id]').forEach((opt) => {
          opt.classList.remove('selected');
        });
      }
    });
  }
}

// Guardar nueva dirección en perfil
function saveNewAddress() {
  const newAddress = {
    id: 'addr_' + Date.now(),
    alias: 'Nueva dirección',
    street: document.getElementById('newStreet').value.trim(),
    corner: document.getElementById('newCorner').value.trim(),
    apartment: document.getElementById('newApartment').value.trim(),
    city: document.getElementById('newCity').value.trim(),
    state: document.getElementById('newState').value.trim(),
    zipCode: document.getElementById('newZipCode').value.trim(),
    country: 'Uruguay',
    phone: document.getElementById('newPhone').value.trim(),
    isDefault: false,
    createdAt: new Date().toISOString(),
  };

  // Validación básica
  if (
    !newAddress.street ||
    !newAddress.city ||
    !newAddress.state ||
    !newAddress.zipCode ||
    !newAddress.phone
  ) {
    alert('Por favor completa todos los campos obligatorios (*)');
    return;
  }

  // Guardar en localStorage
  const addresses = readLS('userAddresses', []);
  addresses.push(newAddress);
  writeLS('userAddresses', addresses);

  // Seleccionar esta dirección
  selectedAddress = newAddress;

  // Recargar lista
  loadSavedAddresses();

  // Ocultar formulario
  document.getElementById('newAddressForm').classList.add('hidden');
  document.getElementById('toggleNewAddress').innerHTML =
    '<i class="bi bi-plus-circle"></i> Usar una dirección diferente';

  alert('Dirección guardada en tu perfil');
}

// Guardar nueva tarjeta en perfil
function saveNewCard() {
  const cardNumber = document.getElementById('newCardNumber').value.trim().replace(/\s/g, '');
  const cardName = document.getElementById('newCardName').value.trim();
  const cardExpiry = document.getElementById('newCardExpiry').value.trim();
  const cardCVV = document.getElementById('newCardCVV').value.trim();

  // Validación básica
  if (!cardNumber || !cardName || !cardExpiry || !cardCVV) {
    alert('Por favor completa todos los campos de la tarjeta');
    return;
  }

  // Validar formato de número de tarjeta (16 dígitos)
  if (cardNumber.length < 13 || cardNumber.length > 19) {
    alert('Número de tarjeta inválido');
    return;
  }

  // Validar formato de vencimiento (MM/AA)
  if (!/^\d{2}\/\d{2}$/.test(cardExpiry)) {
    alert('Formato de vencimiento inválido (MM/AA)');
    return;
  }

  // Validar CVV (3-4 dígitos)
  if (cardCVV.length < 3 || cardCVV.length > 4) {
    alert('CVV inválido');
    return;
  }

  // Detectar marca de tarjeta
  const detectCardBrand = (number) => {
    if (/^4/.test(number)) return 'Visa';
    if (/^5[1-5]/.test(number)) return 'Mastercard';
    if (/^3[47]/.test(number)) return 'Amex';
    return 'Otra';
  };

  const newCard = {
    id: 'card_' + Date.now(),
    alias: detectCardBrand(cardNumber),
    lastFour: cardNumber.slice(-4),
    cardName: cardName,
    expiry: cardExpiry,
    brand: detectCardBrand(cardNumber).toLowerCase(),
    isDefault: false,
    createdAt: new Date().toISOString(),
  };

  // Guardar en localStorage
  const cards = readLS('userCards', []);
  cards.push(newCard);
  writeLS('userCards', cards);

  // Seleccionar esta tarjeta
  selectedCard = newCard;

  // Recargar lista
  loadSavedCards();

  // Ocultar formulario
  document.getElementById('newCardForm').classList.add('hidden');
  document.getElementById('toggleNewCard').innerHTML =
    '<i class="bi bi-plus-circle"></i> Usar una tarjeta diferente';

  alert('Tarjeta guardada en tu perfil');
}

// ===== MÉTODOS DE PAGO =====
function setupPaymentMethods() {
  const cardPaymentContent = document.getElementById('cardPaymentContent');
  const transferInfo = document.getElementById('transferInfo');
  const mercadoPagoInfo = document.getElementById('mercadoPagoInfo');
  const cryptoInfo = document.getElementById('cryptoInfo');

  document.querySelectorAll('input[name="paymentMethod"]').forEach((radio) => {
    radio.addEventListener('change', (e) => {
      selectedPaymentMethod = e.target.value;

      // Ocultar todos los formularios
      if (cardPaymentContent) cardPaymentContent.classList.add('hidden');
      if (transferInfo) transferInfo.classList.add('hidden');
      if (mercadoPagoInfo) mercadoPagoInfo.classList.add('hidden');
      if (cryptoInfo) cryptoInfo.classList.add('hidden');

      // Mostrar el formulario correspondiente
      switch (selectedPaymentMethod) {
        case 'card':
          if (cardPaymentContent) cardPaymentContent.classList.remove('hidden');
          break;
        case 'transfer':
          if (transferInfo) transferInfo.classList.remove('hidden');
          break;
        case 'mercadopago':
          if (mercadoPagoInfo) mercadoPagoInfo.classList.remove('hidden');
          break;
        case 'crypto':
          if (cryptoInfo) cryptoInfo.classList.remove('hidden');
          break;
      }
    });
  });
}

// Formateo de campos de tarjeta
function setupCardFormatting() {
  const cardNumber = document.getElementById('newCardNumber');
  const cardExpiry = document.getElementById('newCardExpiry');
  const cardCVV = document.getElementById('newCardCVV');

  if (cardNumber) {
    cardNumber.addEventListener('input', (e) => {
      let value = e.target.value.replace(/\s/g, '');
      value = value.replace(/(\d{4})/g, '$1 ').trim();
      e.target.value = value;
    });
  }

  if (cardExpiry) {
    cardExpiry.addEventListener('input', (e) => {
      let value = e.target.value.replace(/\D/g, '');
      if (value.length >= 2) {
        value = value.slice(0, 2) + '/' + value.slice(2, 4);
      }
      e.target.value = value;
    });
  }

  if (cardCVV) {
    cardCVV.addEventListener('input', (e) => {
      e.target.value = e.target.value.replace(/\D/g, '');
    });
  }
}

// ===== RESUMEN DEL PEDIDO =====
function loadOrderSummary() {
  const itemsContainer = document.getElementById('orderItems');
  const { items, subtotal, discount, shippingCost, shippingType, total, couponCode } = checkoutData;

  // Renderizar productos
  itemsContainer.innerHTML = items
    .map(
      (item) => `
    <div class="order-item">
      <img src="${item.image}" alt="${item.name}" loading="lazy" />
      <div class="order-item-info">
        <h4>${item.name}</h4>
        <p>Cantidad: ${item.count || 1}</p>
      </div>
      <div class="order-item-price">
        ${money(item.cost * (item.count || 1), 'USD')}
      </div>
    </div>
  `
    )
    .join('');

  // Subtotal
  document.getElementById('summarySubtotal').textContent = money(subtotal, 'USD');

  // Descuento
  const discountLabelEl = document.getElementById('summaryDiscountLabel');
  const discountEl = document.getElementById('summaryDiscount');

  if (discountLabelEl && discountEl) {
    if (discount && discount > 0) {
      discountLabelEl.textContent = couponCode ? `Descuento (${couponCode})` : 'Descuento';
      discountEl.textContent = `- ${money(discount, 'USD')}`;
    } else {
      discountLabelEl.textContent = 'Descuento';
      discountEl.textContent = money(0, 'USD');
    }
  }

  // Envío
  document.getElementById('summaryShipping').textContent = money(shippingCost, 'USD');
  document.getElementById('summaryShippingLabel').textContent = `Envío (${
    shippingType.split(' ')[0]
  })`;

  // Total final
  document.getElementById('summaryTotal').textContent = money(total, 'USD');
}

// ===== CONFIRMAR COMPRA =====
<<<<<<< HEAD:js/checkout.js
function confirmPurchase() {
=======
async function confirmPurchase() {
>>>>>>> yenifer-gonzalez:frontend/js/checkout.js
  // Validar dirección
  if (!selectedAddress && !validateNewAddressForm()) {
    alert('Por favor selecciona o ingresa una dirección de envío');
    document.getElementById('shippingSection').scrollIntoView({ behavior: 'smooth' });
    return;
  }

  // Si no hay dirección seleccionada pero el formulario está lleno, usar esos datos
  if (!selectedAddress) {
    selectedAddress = {
      street: document.getElementById('newStreet').value.trim(),
      corner: document.getElementById('newCorner').value.trim(),
      apartment: document.getElementById('newApartment').value.trim(),
      city: document.getElementById('newCity').value.trim(),
      state: document.getElementById('newState').value.trim(),
      zipCode: document.getElementById('newZipCode').value.trim(),
      phone: document.getElementById('newPhone').value.trim(),
    };
  }

  // Validar método de pago
  if (selectedPaymentMethod === 'card') {
    // Si hay tarjeta seleccionada, usarla
    if (selectedCard) {
<<<<<<< HEAD:js/checkout.js
      // Ya está validada y guardada, no necesita más validación
      console.log('Usando tarjeta guardada:', selectedCard.alias);
=======
>>>>>>> yenifer-gonzalez:frontend/js/checkout.js
    } else {
      // Validar formulario de nueva tarjeta
      const cardNumber = document.getElementById('newCardNumber').value.trim();
      const cardName = document.getElementById('newCardName').value.trim();
      const cardExpiry = document.getElementById('newCardExpiry').value.trim();
      const cardCVV = document.getElementById('newCardCVV').value.trim();

      if (!cardNumber || !cardName || !cardExpiry || !cardCVV) {
        alert('Por favor selecciona una tarjeta guardada o completa los datos de la nueva tarjeta');
        document.getElementById('paymentSection').scrollIntoView({ behavior: 'smooth' });
        return;
      }

      // Validaciones básicas
      if (cardNumber.replace(/\s/g, '').length < 13) {
        alert('Número de tarjeta inválido');
        return;
      }

      if (cardExpiry.length < 5 || !cardExpiry.includes('/')) {
        alert('Fecha de vencimiento inválida (MM/AA)');
        return;
      }

      if (cardCVV.length < 3) {
        alert('CVV inválido');
        return;
      }
    }
  } else if (selectedPaymentMethod === 'crypto') {
    // Validación especial para crypto
    const selectedCrypto = document.querySelector('input[name="cryptoCurrency"]:checked');
    const cryptoName = selectedCrypto ? selectedCrypto.value : 'Bitcoin';

    // Mostrar advertencia de simulación
    const confirmed = confirm(
<<<<<<< HEAD:js/checkout.js
      `⚠️ SIMULACIÓN DE PAGO\n\n` +
=======
      `SIMULACIÓN DE PAGO\n\n` +
>>>>>>> yenifer-gonzalez:frontend/js/checkout.js
        `Has seleccionado pagar con ${cryptoName}.\n\n` +
        `En un entorno real:\n` +
        `• Se generaría una dirección de pago única\n` +
        `• Deberías enviar el pago exacto a esa dirección\n` +
        `• El pedido quedaría pendiente hasta confirmar el pago\n` +
        `• Este proceso puede tardar varios minutos\n\n` +
        `Como esto es una simulación educativa, el pedido se confirmará inmediatamente.\n\n` +
        `¿Deseas continuar?`
    );

    if (!confirmed) {
      return;
    }
  } else if (selectedPaymentMethod === 'mercadopago') {
    // Validación especial para Mercado Pago
    const confirmed = confirm(
<<<<<<< HEAD:js/checkout.js
      `ℹ️ SIMULACIÓN DE PAGO\n\n` +
=======
      `SIMULACIÓN DE PAGO\n\n` +
>>>>>>> yenifer-gonzalez:frontend/js/checkout.js
        `En un entorno real, serías redirigido a Mercado Pago para completar el pago de forma segura.\n\n` +
        `Como esto es una simulación educativa, el pedido se confirmará inmediatamente.\n\n` +
        `¿Deseas continuar?`
    );

    if (!confirmed) {
      return;
    }
  }

  // Obtener criptomoneda seleccionada si aplica
  let cryptoCurrency = null;
  if (selectedPaymentMethod === 'crypto') {
    const selectedCrypto = document.querySelector('input[name="cryptoCurrency"]:checked');
    cryptoCurrency = selectedCrypto ? selectedCrypto.value : 'Bitcoin';
  }

  // Crear orden
  const order = {
    id: 'ORD-' + Date.now(),
    date: new Date().toISOString(),
    items: checkoutData.items,
    subtotal: checkoutData.subtotal,
    discount: checkoutData.discount || 0,
    couponCode: checkoutData.couponCode || null,
    shipping: checkoutData.shippingCost,
    shippingType: checkoutData.shippingType,
    total: checkoutData.total,
    address: selectedAddress,
    paymentMethod: selectedPaymentMethod,
    cryptoCurrency: cryptoCurrency,
    status: 'pending',
  };

<<<<<<< HEAD:js/checkout.js
  // Guardar orden
  const orders = readLS('orders', []);
  orders.push(order);
  writeLS('orders', orders);
=======
  // Guardar orden localmente
  saveOrderLocally(order);

  // Guardar orden en la base de datos
  await saveOrderToDatabase(order);
>>>>>>> yenifer-gonzalez:frontend/js/checkout.js

  // Limpiar carrito
  writeLS('cart', []);
  localStorage.removeItem('checkoutData');

  // Mostrar modal de éxito
  showSuccessModal(order);
}

// Validar formulario de nueva dirección
function validateNewAddressForm() {
  const form = document.getElementById('newAddressForm');
  if (form.classList.contains('hidden')) return false;

  const street = document.getElementById('newStreet').value.trim();
  const city = document.getElementById('newCity').value.trim();
  const state = document.getElementById('newState').value.trim();
  const zipCode = document.getElementById('newZipCode').value.trim();
  const phone = document.getElementById('newPhone').value.trim();

  return street && city && state && zipCode && phone;
}

// Obtener nombre del método de pago
function getPaymentMethodName(order) {
  const methods = {
    card: 'Tarjeta de crédito/débito',
    transfer: 'Transferencia bancaria',
    mercadopago: 'Mercado Pago',
    crypto: order.cryptoCurrency ? `Criptomoneda (${order.cryptoCurrency})` : 'Criptomoneda',
  };
  return methods[order.paymentMethod] || 'Otro';
}

// Obtener recordatorio según método de pago
function getPaymentReminder(order) {
  switch (order.paymentMethod) {
    case 'transfer':
      return '<div class="transfer-reminder"><i class="bi bi-info-circle-fill"></i><span>Recuerda enviar el comprobante de transferencia a <strong>pagos@emercado.com</strong></span></div>';
    case 'mercadopago':
      return '<div class="transfer-reminder" style="background: rgba(0, 158, 227, 0.1); border-color: rgba(0, 158, 227, 0.3);"><i class="bi bi-wallet2" style="color: #009ee3;"></i><span><strong>Simulación:</strong> En un entorno real, serías redirigido a Mercado Pago para completar el pago de forma segura</span></div>';
    case 'crypto':
      const cryptoIcons = {
        Bitcoin: '<i class="fab fa-bitcoin" style="color: #f7931a;"></i>',
        Ethereum: '<i class="fab fa-ethereum" style="color: #627eea;"></i>',
        USDT: '<i class="tether-icon-fab" style="color: #26a17b;"></i>',
      };
      const icon = cryptoIcons[order.cryptoCurrency] || '<i class="fab fa-bitcoin"></i>';
      const address = generateCryptoAddress(order.cryptoCurrency);
      return `
        <div class="transfer-reminder crypto-payment" style="background: rgba(247, 147, 26, 0.1); border-color: rgba(247, 147, 26, 0.3);">
          ${icon}
          <div style="flex: 1;">
            <div style="margin-bottom: 0.75rem;">
              <strong>Dirección de pago ${order.cryptoCurrency}:</strong>
            </div>
            <div style="background: rgba(0,0,0,0.1); padding: 0.75rem; border-radius: 6px; margin-bottom: 0.5rem; word-break: break-all;">
              <code style="font-family: monospace; font-size: 0.85rem; user-select: all;">${address}</code>
            </div>
            <div style="font-size: 0.85rem; color: var(--text-secondary); margin-top: 0.5rem;">
              <i class="bi bi-info-circle"></i> <strong>Simulación:</strong> En un entorno real, deberías enviar el pago a esta dirección antes de que el pedido se complete
            </div>
          </div>
        </div>
      `;
    default:
      return '';
  }
}

// Generar dirección crypto realista según el tipo
function generateCryptoAddress(currency) {
  const addresses = {
    Bitcoin: '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa',
    Ethereum: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    USDT: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
  };
  return addresses[currency] || addresses['Bitcoin'];
}

// ===== MODAL DE ÉXITO =====
function showSuccessModal(order) {
  const modal = document.createElement('div');
  modal.className = 'success-modal';
  modal.innerHTML = `
    <div class="success-overlay"></div>
    <div class="success-content">
      <div class="success-icon">
        <div class="success-icon-circle">
          <i class="bi bi-check-lg"></i>
        </div>
      </div>
      <h2>¡Compra realizada con éxito!</h2>
      <p class="success-subtitle">Tu pedido ha sido procesado correctamente</p>
      
      <div class="order-summary">
        <div class="order-summary-header">
          <i class="bi bi-receipt"></i>
          <span>Resumen del pedido</span>
        </div>
        <div class="order-details">
          <div class="order-detail-row">
            <span class="detail-label">Número de orden:</span>
            <span class="detail-value">${order.id}</span>
          </div>
          <div class="order-detail-row">
            <span class="detail-label">Productos:</span>
            <span class="detail-value">${order.items.length} ${
    order.items.length === 1 ? 'artículo' : 'artículos'
  }</span>
          </div>
          <div class="order-detail-row">
            <span class="detail-label">Método de pago:</span>
            <span class="detail-value">${getPaymentMethodName(order)}</span>
          </div>
          <div class="order-detail-row total-row">
            <span class="detail-label">Total pagado:</span>
            <span class="detail-value total-amount">${money(order.total, 'USD')}</span>
          </div>
        </div>
      </div>

      ${getPaymentReminder(order)}
      
      <div class="success-actions">
        <button onclick="window.location.href='order-confirmation.html?order=${
          order.id
        }'" class="btn-view-order">
          <i class="bi bi-receipt"></i>
          Ver detalles del pedido
        </button>
      </div>

      <div class="redirect-message">
        <div class="spinner"></div>
        <p>Serás redirigido en <span id="countdown">8</span> segundos...</p>
        <button onclick="window.location.href='order-confirmation.html?order=${
          order.id
        }'" class="btn-redirect-now">
          Ir ahora
        </button>
      </div>
    </div>
  `;

  document.body.appendChild(modal);

  // Countdown para redirección
  let countdown = 8;
  const countdownEl = document.getElementById('countdown');

  const timer = setInterval(() => {
    countdown--;
    if (countdownEl) {
      countdownEl.textContent = countdown;
    }
    if (countdown <= 0) {
      clearInterval(timer);
      window.location.href = `order-confirmation.html?order=${order.id}`;
    }
  }, 1000);

  // Los estilos del modal ahora están en checkout.css
}
<<<<<<< HEAD:js/checkout.js
=======

// guardar solo localmente
function saveOrderLocally(order) {
  const orders = readLS('orders', []);
  orders.push(order);
  writeLS('orders', orders);
}

// Función para guardar en la base de datos
async function saveOrderToDatabase(order) {
  try {
    const token = localStorage.getItem('authToken');
    if (!token) {
      throw new Error('No autenticado');
    }

    const response = await fetch(`${API_BASE_URL}/cart`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(order),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error al guardar orden');
    }
  } catch (error) {
    console.error('Error al guardar orden en la base de datos:', error);
    // La orden ya se guardó localmente, así que el usuario puede continuar
    throw error;
  }
}
>>>>>>> yenifer-gonzalez:frontend/js/checkout.js
