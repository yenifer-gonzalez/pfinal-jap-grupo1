/**
 * Adapter que intenta usar el backend, pero hace fallback a localStorage
 */

const USE_BACKEND = true; // Cambiar a false para volver a localStorage

// ===== DIRECCIONES =====

async function getAddressesAdapter() {
  if (USE_BACKEND) {
    try {
      return await getAddresses();
    } catch (error) {
      console.warn('Backend no disponible, usando localStorage');
    }
  }
  return readLS('userAddresses', []);
}

async function saveAddressAdapter(addressData) {
  if (USE_BACKEND) {
    try {
      const saved = await createAddress(addressData);
      // También guardar en localStorage por ahora
      const local = readLS('userAddresses', []);
      local.push(saved);
      writeLS('userAddresses', local);
      return saved;
    } catch (error) {
      console.error('Error guardando en backend:', error);
    }
  }
  
  // Fallback localStorage
  const addresses = readLS('userAddresses', []);
  addresses.push(addressData);
  writeLS('userAddresses', addresses);
  return addressData;
}

// ... Similar para cards, wishlist, orders