/**
 * Obtiene el token de autenticación
 */
function getAuthToken() {
  return localStorage.getItem('authToken');
}

/**
 * Hace una petición al backend
 */
async function apiRequest(endpoint, options = {}) {
  const token = getAuthToken();

  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  };

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Error en la petición');
    }

    return data;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

// ===== PROFILE =====
async function getProfile() {
  const response = await apiRequest('/profile');
  return response.data;
}

async function updateProfile(profileData) {
  const response = await apiRequest('/profile', {
    method: 'PUT',
    body: JSON.stringify(profileData),
  });
  return response.data;
}

async function getAddresses() {
  const response = await apiRequest('/profile/addresses');
  return response.data;
}

async function createAddress(addressData) {
  const response = await apiRequest('/profile/addresses', {
    method: 'POST',
    body: JSON.stringify(addressData),
  });
  return response.data;
}

async function updateAddress(addressId, updates) {
  const response = await apiRequest(`/profile/addresses/${addressId}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
  return response.data;
}

async function deleteAddressAPI(addressId) {
  await apiRequest(`/profile/addresses/${addressId}`, {
    method: 'DELETE',
  });
}

async function getCards() {
  const response = await apiRequest('/profile/cards');
  return response.data;
}

async function createCard(cardData) {
  const response = await apiRequest('/profile/cards', {
    method: 'POST',
    body: JSON.stringify(cardData),
  });
  return response.data;
}

async function updateCard(cardId, updates) {
  const response = await apiRequest(`/profile/cards/${cardId}`, {
    method: 'PUT',
    body: JSON.stringify(updates),
  });
  return response.data;
}

async function deleteCardAPI(cardId) {
  await apiRequest(`/profile/cards/${cardId}`, {
    method: 'DELETE',
  });
}

// ===== WISHLIST =====
async function getWishlist() {
  const response = await apiRequest('/wishlist');
  return response.data;
}

async function addToWishlistAPI(item) {
  const response = await apiRequest('/wishlist', {
    method: 'POST',
    body: JSON.stringify(item),
  });
  return response.data;
}

async function removeFromWishlistAPI(productId) {
  await apiRequest(`/wishlist/${productId}`, {
    method: 'DELETE',
  });
}

// ===== ORDERS =====
async function getOrders() {
  const response = await apiRequest('/orders');
  return response.data;
}

async function getOrderById(orderId) {
  const response = await apiRequest(`/orders/${orderId}`);
  return response.data;
}

async function createOrder(orderData) {
  const response = await apiRequest('/orders', {
    method: 'POST',
    body: JSON.stringify(orderData),
  });
  return response.data;
}

// ===== CART =====
// Nota: POST /cart guarda órdenes finalizadas (no carritos temporales)
