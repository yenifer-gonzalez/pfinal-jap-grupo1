/**
 * Storage temporal en memoria
 * Yenifer reemplazará esto con la base de datos real
 */

class MemoryStorage {
  constructor() {
    this.users = new Map(); // userId -> userData
  }

  // Perfil de usuario
  getUserProfile(userId) {
    return this.users.get(userId) || {
      profile: {},
      addresses: [],
      cards: [],
      orders: [],
      wishlist: [],
      recentlyViewed: []
    };
  }

  setUserProfile(userId, data) {
    this.users.set(userId, data);
  }

  // === PERFIL ===
  getProfile(userId) {
    const profile = this.getUserProfile(userId);
    return profile.profile || {};
  }

  updateProfile(userId, data) {
    const profile = this.getUserProfile(userId);
    profile.profile = { ...profile.profile, ...data };
    this.setUserProfile(userId, profile);
    return profile.profile;
  }

  // === DIRECCIONES ===
  getAddresses(userId) {
    const profile = this.getUserProfile(userId);
    return profile.addresses || [];
  }

  addAddress(userId, address) {
    const profile = this.getUserProfile(userId);
    profile.addresses = profile.addresses || [];
    profile.addresses.push(address);
    this.setUserProfile(userId, profile);
    return address;
  }

  updateAddress(userId, addressId, updates) {
    const profile = this.getUserProfile(userId);
    const index = profile.addresses.findIndex(a => a.id === addressId);
    if (index !== -1) {
      profile.addresses[index] = { ...profile.addresses[index], ...updates, updatedAt: new Date().toISOString() };
      this.setUserProfile(userId, profile);
      return profile.addresses[index];
    }
    return null;
  }

  deleteAddress(userId, addressId) {
    const profile = this.getUserProfile(userId);
    profile.addresses = profile.addresses.filter(a => a.id !== addressId);
    this.setUserProfile(userId, profile);
    return true;
  }

  // === TARJETAS ===
  getCards(userId) {
    const profile = this.getUserProfile(userId);
    return profile.cards || [];
  }

  addCard(userId, card) {
    const profile = this.getUserProfile(userId);
    profile.cards = profile.cards || [];
    profile.cards.push(card);
    this.setUserProfile(userId, profile);
    return card;
  }

  updateCard(userId, cardId, updates) {
    const profile = this.getUserProfile(userId);
    const index = profile.cards.findIndex(c => c.id === cardId);
    if (index !== -1) {
      profile.cards[index] = { ...profile.cards[index], ...updates, updatedAt: new Date().toISOString() };
      this.setUserProfile(userId, profile);
      return profile.cards[index];
    }
    return null;
  }

  deleteCard(userId, cardId) {
    const profile = this.getUserProfile(userId);
    profile.cards = profile.cards.filter(c => c.id !== cardId);
    this.setUserProfile(userId, profile);
    return true;
  }

  // === FAVORITOS/WISHLIST ===
  getWishlist(userId) {
    const profile = this.getUserProfile(userId);
    return profile.wishlist || [];
  }

  addToWishlist(userId, item) {
    const profile = this.getUserProfile(userId);
    profile.wishlist = profile.wishlist || [];
    
    // Evitar duplicados
    const exists = profile.wishlist.some(w => w.productId === item.productId);
    if (exists) return null;
    
    profile.wishlist.push(item);
    this.setUserProfile(userId, profile);
    return item;
  }

  removeFromWishlist(userId, productId) {
    const profile = this.getUserProfile(userId);
    profile.wishlist = profile.wishlist.filter(w => w.productId != productId);
    this.setUserProfile(userId, profile);
    return true;
  }

  // === ÓRDENES ===
  getOrders(userId) {
    const profile = this.getUserProfile(userId);
    return profile.orders || [];
  }

  getOrderById(userId, orderId) {
    const orders = this.getOrders(userId);
    return orders.find(o => o.id === orderId) || null;
  }

  addOrder(userId, order) {
    const profile = this.getUserProfile(userId);
    profile.orders = profile.orders || [];
    profile.orders.push(order);
    this.setUserProfile(userId, profile);
    return order;
  }

  // === PRODUCTOS VISTOS RECIENTEMENTE ===
  getRecentlyViewed(userId) {
    const profile = this.getUserProfile(userId);
    return profile.recentlyViewed || [];
  }

  addRecentlyViewed(userId, product) {
    const profile = this.getUserProfile(userId);
    profile.recentlyViewed = profile.recentlyViewed || [];
    
    // Remover si ya existe
    profile.recentlyViewed = profile.recentlyViewed.filter(p => p.id !== product.id);
    
    // Agregar al inicio
    profile.recentlyViewed.unshift(product);
    
    // Limitar a 10
    profile.recentlyViewed = profile.recentlyViewed.slice(0, 10);
    
    this.setUserProfile(userId, profile);
    return product;
  }
}

// Singleton
const storage = new MemoryStorage();

module.exports = storage;