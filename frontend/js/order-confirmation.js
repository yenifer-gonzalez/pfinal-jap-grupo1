// ===== ORDER CONFIRMATION PAGE =====

// Obtener el ID del pedido de la URL
function getOrderIdFromURL() {
  const params = new URLSearchParams(window.location.search);
  return params.get('order');
}

// Cargar datos del pedido
function loadOrderData() {
  const orderId = getOrderIdFromURL();

  if (!orderId) {
    showEmptyState();
    return;
  }

  // Buscar el pedido en localStorage
  const orders = readLS('orders', []);
  const order = orders.find((o) => o.id === orderId);

  if (!order) {
    showEmptyState();
    return;
  }

  // Rellenar los datos
  displayOrderDetails(order);
  displayShippingAddress(order.address);
  displayPaymentMethod(order);
  displayOrderItems(order.items);
  displayOrderSummary(order);
}

// Mostrar detalles del pedido
function displayOrderDetails(order) {
  document.getElementById('orderNumber').textContent = order.id;
  document.getElementById('orderDate').textContent = formatDate(order.date);
}

// Mostrar dirección de envío
function displayShippingAddress(address) {
  const container = document.getElementById('shippingAddress');

  container.innerHTML = `
    <div class="address-info">
      <p><strong>${address.alias || 'Dirección de envío'}</strong></p>
      <p>${address.street}${address.corner ? ` esquina ${address.corner}` : ''}${
    address.apartment ? `, ${address.apartment}` : ''
  }</p>
      <p>${address.city}, ${address.state} ${address.zipCode}</p>
      ${address.country ? `<p>${address.country}</p>` : ''}
      ${address.phone ? `<p><i class="bi bi-telephone"></i> ${address.phone}</p>` : ''}
    </div>
  `;
}

// Mostrar método de pago
function displayPaymentMethod(order) {
  const container = document.getElementById('paymentMethod');

  let icon = 'bi-credit-card';
  let title = 'Tarjeta de crédito/débito';
  let description = 'Pago procesado correctamente';

  switch (order.paymentMethod) {
    case 'transfer':
      icon = 'bi-bank';
      title = 'Transferencia bancaria';
      description = 'Recuerda enviar el comprobante a pagos@emercado.com';
      break;
    case 'mercadopago':
      icon = 'bi-wallet2';
      title = 'Mercado Pago';
      description = 'Pago procesado a través de Mercado Pago';
      break;
    case 'crypto':
      // Icono específico según la criptomoneda
      if (order.cryptoCurrency === 'Bitcoin') {
        icon = 'fab fa-bitcoin';
      } else if (order.cryptoCurrency === 'Ethereum') {
        icon = 'fab fa-ethereum';
      } else if (order.cryptoCurrency === 'USDT') {
        icon = 'fa-brands fa-usdt';
      } else {
        icon = 'fab fa-bitcoin'; // Fallback genérico
      }
      title = 'Criptomoneda';
      description = order.cryptoCurrency
        ? `Pago en ${order.cryptoCurrency}`
        : 'Pago en criptomoneda';
      break;
  }

  container.innerHTML = `
    <div class="payment-info">
      <i class="${icon}"></i>
      <div class="payment-details">
        <h3>${title}</h3>
        <p>${description}</p>
      </div>
    </div>
  `;
}

// Mostrar productos
function displayOrderItems(items) {
  const container = document.getElementById('orderItems');

  container.innerHTML = items
    .map(
      (item) => `
    <div class="order-item">
      <img src="${item.image}" alt="${item.name}" loading="lazy" />
      <div class="order-item-info">
        <h3>${item.name}</h3>
        <p>Cantidad: ${item.count || 1}</p>
      </div>
      <div class="order-item-price">
        ${money(item.cost * (item.count || 1), 'USD')}
      </div>
    </div>
  `
    )
    .join('');
}

// Mostrar resumen
function displayOrderSummary(order) {
  document.getElementById('summarySubtotal').textContent = money(order.subtotal, 'USD');
  document.getElementById('summaryShipping').textContent = money(order.shipping, 'USD');
  document.getElementById('summaryShippingLabel').textContent = `Envío (${
    order.shippingType.split(' ')[0]
  })`;
  document.getElementById('summaryTotal').textContent = money(order.total, 'USD');
}

// Mostrar estado vacío
function showEmptyState() {
  document.querySelector('.success-banner').style.display = 'none';
  document.querySelector('.order-grid').style.display = 'none';
  document.getElementById('emptyState').classList.remove('hidden');
}

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
  loadOrderData();
});
